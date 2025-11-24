import React, { useState, useEffect } from 'react';
import { CanvasBoard } from './CanvasBoard';

interface ContractViewerProps {
    dataChannel: RTCDataChannel | null;
    isControlEnabled: boolean;
}

const PAGES = [
    {
        title: "제 1장 총칙",
        content: (
            <>
                <p><strong>제 1조 (목적)</strong></p>
                <p>본 계약은 서비스 제공자(이하 "갑")와 이용자(이하 "을") 간의 권리 및 의무를 규정함을 목적으로 한다.</p>
                <br />
                <p><strong>제 2조 (정의)</strong></p>
                <p>1. "서비스"라 함은 갑이 제공하는 모든 온라인 서비스를 의미한다.</p>
                <p>2. "이용자"라 함은 본 약관에 동의하고 서비스를 이용하는 자를 말한다.</p>
            </>
        )
    },
    {
        title: "제 2장 서비스 이용",
        content: (
            <>
                <p><strong>제 3조 (이용 계약의 체결)</strong></p>
                <p>이용 계약은 을이 약관에 동의하고 신청서를 제출함으로써 체결된다.</p>
                <br />
                <p><strong>제 4조 (서비스의 제공)</strong></p>
                <p>갑은 을에게 24시간 서비스를 제공하기 위해 노력한다.</p>
                <p>단, 정기 점검 등의 사유로 중단될 수 있다.</p>
            </>
        )
    },
    {
        title: "제 3장 의무 및 책임",
        content: (
            <>
                <p><strong>제 5조 (갑의 의무)</strong></p>
                <p>갑은 관련 법령을 준수하며, 지속적이고 안정적인 서비스를 제공해야 한다.</p>
                <br />
                <p><strong>제 6조 (을의 의무)</strong></p>
                <p>을은 서비스 이용 시 타인의 권리를 침해해서는 안 된다.</p>
                <p>을은 자신의 계정 정보를 안전하게 관리해야 한다.</p>
            </>
        )
    },
    {
        title: "제 4장 요금 및 결제",
        content: (
            <>
                <p><strong>제 7조 (요금)</strong></p>
                <p>서비스 이용 요금은 별도 고지된 가격표에 따른다.</p>
                <br />
                <p><strong>제 8조 (결제)</strong></p>
                <p>을은 매월 지정된 날짜에 요금을 납부해야 한다.</p>
                <p>미납 시 서비스 이용이 제한될 수 있다.</p>
            </>
        )
    },
    {
        title: "제 5장 계약 해지 및 서명",
        content: (
            <>
                <p><strong>제 9조 (해지)</strong></p>
                <p>을은 언제든지 계약 해지를 요청할 수 있으며, 갑은 이를 즉시 처리해야 한다.</p>
                <br />
                <br />
                <div style={{ marginTop: '300px' }}>
                    <p>상기 내용을 확인하였으며 이에 동의합니다.</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px' }}>
                        <div>
                            <div style={{ borderBottom: '1px solid black', width: '200px', height: '50px' }}></div>
                            <p>서비스 제공자 (인)</p>
                        </div>
                        <div>
                            <div style={{ borderBottom: '1px solid black', width: '200px', height: '50px' }}></div>
                            <p>이용자 (인)</p>
                        </div>
                    </div>
                </div>
            </>
        )
    }
];

export const ContractViewer: React.FC<ContractViewerProps> = ({ dataChannel, isControlEnabled }) => {
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        if (!dataChannel) return;

        const handleMessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'page-change') {
                    setCurrentPage(data.page);
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

    const changePage = (newPage: number) => {
        if (newPage < 0 || newPage >= PAGES.length) return;
        setCurrentPage(newPage);

        if (dataChannel && dataChannel.readyState === 'open') {
            dataChannel.send(JSON.stringify({ type: 'page-change', page: newPage }));
        }
    };

    return (
        <div style={{ width: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button className="btn-secondary" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 0}>
                    ← 이전
                </button>
                <span style={{ fontWeight: 600, color: '#7F8C8D' }}>{currentPage + 1} / {PAGES.length}</span>
                <button className="btn-secondary" onClick={() => changePage(currentPage + 1)} disabled={currentPage === PAGES.length - 1}>
                    다음 →
                </button>
            </div>

            <div style={{
                position: 'relative',
                width: '800px',
                height: '1000px',
                backgroundColor: 'white',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                borderRadius: '4px',
                overflow: 'hidden'
            }}>
                {/* Contract Content */}
                <div style={{ padding: '60px', height: '100%', boxSizing: 'border-box', overflowY: 'auto', textAlign: 'left' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>{PAGES[currentPage].title}</h2>
                    <div style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                        {PAGES[currentPage].content}
                    </div>
                </div>

                {/* Canvas Overlay */}
                <CanvasBoard
                    dataChannel={dataChannel}
                    isControlEnabled={isControlEnabled}
                    width={800}
                    height={1000}
                    pageIndex={currentPage}
                />
            </div>
        </div>
    );
};
