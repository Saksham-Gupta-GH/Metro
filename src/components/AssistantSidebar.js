import { useState } from 'react';
import { Button, Form, Offcanvas } from 'react-bootstrap';
import { apiRequest } from '../lib/api';
import { FaPaperPlane, FaRobot } from 'react-icons/fa6';

const starterMessages = [
  {
    role: 'assistant',
    text: 'Ask me about Bangalore Metro lines, stations, or interchanges.',
  },
];

function AssistantSidebar() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(starterMessages);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setMessage('');

    try {
      const response = await apiRequest('/api/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ message: trimmed }),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: response.fallbackReason
            ? `${response.reply}\n\nStatus: ${response.fallbackReason}`
            : response.reply,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: err.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ Floating Button (FIXED PROPERLY) */}
      {!show && (
        <Button
          onClick={() => setShow(true)}
          variant="dark"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1020, // lower than offcanvas
            borderRadius: '25px',
            padding: '10px 16px',
          }}
          className="d-flex align-items-center gap-2 shadow"
        >
          <FaRobot />
          Metro AI Help
        </Button>
      )}

      {/* ✅ Sidebar */}
      <Offcanvas
        show={show}
        onHide={() => setShow(false)}
        placement="end"
        style={{ width: '350px' }}
      >
<Offcanvas.Header
  closeButton
  className="border-bottom"
  style={{ backgroundColor: '#f1f3f5' }}
>
  <Offcanvas.Title
    style={{
      fontWeight: '600',
      fontSize: '18px',
      letterSpacing: '0.5px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}
  >
    <span style={{ fontSize: '20px' }}><i class="bi bi-train-front"></i></span>
    Bangalore Metro Assistant
  </Offcanvas.Title>
</Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column p-0">
          
          {/* Messages */}
          <div
            className="flex-grow-1 p-3"
            style={{
              overflowY: 'auto',
              backgroundColor: '#f8f9fa',
            }}
          >
            {messages.map((entry, index) => (
              <div
                key={index}
                className={`mb-2 d-flex ${
                  entry.role === 'user'
                    ? 'justify-content-end'
                    : 'justify-content-start'
                }`}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    backgroundColor:
                      entry.role === 'user' ? '#0d6efd' : '#e9ecef',
                    color:
                      entry.role === 'user' ? 'white' : 'black',
                  }}
                >
                  {entry.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-top p-2 bg-white">
            <Form onSubmit={sendMessage} className="d-flex gap-2">
              <Form.Control
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about metro..."
              />
              <Button type="submit" disabled={loading}>
                <FaPaperPlane />
              </Button>
            </Form>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default AssistantSidebar;