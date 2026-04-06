import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { apiRequest } from '../lib/api';

const starterMessages = [
  {
    role: 'assistant',
    text: 'Ask me about Bangalore Metro lines, stations, or interchanges.',
  },
];

function AssistantSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(starterMessages);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (event) => {
    event.preventDefault();
    const trimmed = message.trim();

    if (!trimmed || loading) {
      return;
    }

    setLoading(true);
    setMessages((current) => [...current, { role: 'user', text: trimmed }]);
    setMessage('');

    try {
      const response = await apiRequest('/api/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ message: trimmed }),
      });

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: response.fallbackReason
            ? `${response.reply}\n\nStatus: ${response.fallbackReason}`
            : response.reply,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: error.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`assistant-shell ${isOpen ? 'open' : ''}`}>
      <Button
        className="assistant-toggle shadow"
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? 'Close Assistant' : 'Metro AI Help'}
      </Button>
      {isOpen ? (
        <div className="assistant-panel shadow-lg">
          <div className="assistant-header">
            <div className="assistant-title">Bangalore Metro Assistant</div>
            <div className="assistant-subtitle">Uses Gemini if configured, otherwise local metro knowledge.</div>
          </div>
          <div className="assistant-messages">
            {messages.map((entry, index) => (
              <div key={`${entry.role}-${index}`} className={`assistant-bubble ${entry.role}`}>
                {entry.text}
              </div>
            ))}
          </div>
          <Form onSubmit={sendMessage} className="assistant-form">
            <Form.Control
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Example: Which line covers Majestic?"
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Ask'}
            </Button>
          </Form>
        </div>
      ) : null}
    </div>
  );
}

export default AssistantSidebar;
