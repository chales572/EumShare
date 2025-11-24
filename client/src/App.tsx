import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useWebRTC } from './hooks/useWebRTC';
import { ContractViewer } from './components/ContractViewer';
import './App.css';

const Landing = () => {
  const navigate = useNavigate();

  const startSession = (role: 'agent' | 'customer') => {
    const roomId = uuidv4();
    navigate(`/room/${roomId}?role=${role}`);
  };

  return (
    <div className="card">
      <h1 className="logo-text">이음 (Eum)</h1>
      <p className="subtitle">고객과 당신을 이어주는 신뢰의 시작</p>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexDirection: 'column' }}>
        <button onClick={() => startSession('agent')} style={{ fontSize: '1.2rem', padding: '1rem' }}>
          상담사로 시작하기
        </button>
        <div style={{ borderTop: '1px solid #eee', margin: '10px 0' }}></div>
        <button className="btn-secondary" onClick={() => {
          const id = prompt('방 ID를 입력하세요');
          if (id) navigate(`/room/${id}?role=customer`);
        }}>
          고객으로 참여하기 (테스트용)
        </button>
      </div>
    </div>
  );
};

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'customer';

  const { dataChannel, isConnected } = useWebRTC(roomId || '');
  const [isControlEnabled, setIsControlEnabled] = useState(role === 'agent');

  useEffect(() => {
    if (!dataChannel) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'control') {
          setIsControlEnabled(data.enabled);
          // Optional: Add toast notification instead of alert
        }
      } catch (e) {
        // Ignore
      }
    };

    dataChannel.addEventListener('message', handleMessage);
    return () => {
      dataChannel.removeEventListener('message', handleMessage);
    };
  }, [dataChannel]);

  const toggleControl = () => {
    if (role !== 'agent') return;

    if (dataChannel && dataChannel.readyState === 'open') {
      const confirm = window.confirm("고객에게 제어권을 부여하시겠습니까?");
      if (confirm) {
        dataChannel.send(JSON.stringify({ type: 'control', enabled: true }));
      } else {
        dataChannel.send(JSON.stringify({ type: 'control', enabled: false }));
      }
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: 'auto' }}>
          <h3 style={{ margin: 0 }}>이음</h3>
          <span className={`status-badge ${isConnected ? 'status-connected' : 'status-waiting'}`}>
            {isConnected ? '● 연결됨' : '○ 대기 중'}
          </span>
        </div>

        <span style={{ color: '#7F8C8D' }}>
          {role === 'agent' ? '상담사 모드' : '고객 모드'}
        </span>

        {role === 'agent' && (
          <button className="btn-accent" onClick={toggleControl}>
            고객 제어권 관리
          </button>
        )}

        <button className="btn-secondary" onClick={() => {
          const url = `${window.location.origin}/room/${roomId}?role=customer`;
          navigator.clipboard.writeText(url);
          alert('고객용 링크가 복사되었습니다!');
        }}>
          초대 링크 복사
        </button>
      </div>

      <div className={`control-indicator ${isControlEnabled ? 'control-active' : 'control-inactive'}`}>
        {isControlEnabled ? '✨ 제어 가능 (서명/밑줄 가능)' : '🔒 보기 전용'}
      </div>

      <ContractViewer
        dataChannel={dataChannel}
        isControlEnabled={isControlEnabled}
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </Router>
  );
}

export default App;
