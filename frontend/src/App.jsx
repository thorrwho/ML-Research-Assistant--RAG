import { useState, useRef, useEffect } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.6 + 0.1,
        color: ["#6366f1", "#a78bfa", "#38bdf8", "#818cf8"][Math.floor(Math.random() * 4)],
      });
    }

    const draw = () => {
      ctx.fillStyle = "#020008";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const ask = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: question }]);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Error connecting to backend. Make sure uvicorn is running.",
        sources: [],
      }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'Space Grotesk', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&display=swap');
        html, body, #root { height: 100%; margin: 0; padding: 0; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #ffffff22; border-radius: 2px; }
        .msg-appear { animation: fadeUp 0.4s ease forwards; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .send-btn:hover { background: #fff !important; color: #000 !important; }
        .source-card:hover { border-color: #ffffff44 !important; background: #ffffff0a !important; }
        input::placeholder { color: #ffffff33; }
        .glow { box-shadow: 0 0 40px #6366f133, 0 0 80px #6366f111; }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>

      {/* Animated Canvas Background */}
      <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, zIndex: 0, width: "100vw", height: "100vh" }} />

      {/* Overlay gradient */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, background: "linear-gradient(to bottom, #00000055 0%, #00000088 60%, #000000bb 100%)", pointerEvents: "none" }} />

      {/* Main content — full screen centered */}
      <div style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
        padding: "0 48px",
      }}>

        {/* Header */}
        <div style={{ padding: "48px 0 24px", textAlign: "center", flexShrink: 0, width: "100%" }}>
          <div style={{ fontSize: 11, letterSpacing: 6, color: "#6366f1", fontFamily: "'Orbitron', monospace", textTransform: "uppercase", marginBottom: 14 }}>
            RAG · Retrieval Augmented Generation
          </div>
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, color: "#fff", letterSpacing: -1, lineHeight: 1.1 }}>
            ML Research
            <br />
            <span style={{ background: "linear-gradient(90deg, #6366f1, #a78bfa, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Assistant
            </span>
          </h1>
          <p style={{ marginTop: 12, color: "#ffffff44", fontSize: 13, letterSpacing: 1.5 }}>
            Ask anything · Powered by Llama 3.3 + Groq
          </p>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 0",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          justifyContent: messages.length === 0 ? "center" : "flex-start",
          alignItems: "stretch",
        }}>

          {messages.length === 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <p style={{ color: "#ffffff22", fontSize: 15, letterSpacing: 1, textAlign: "center", lineHeight: 2 }}>
                Ask a question about Machine Learning,<br />Neural Networks or Large Language Models
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className="msg-appear" style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: msg.role === "user" ? "#6366f1" : "#38bdf8", fontFamily: "'Orbitron', monospace", marginBottom: 6, textTransform: "uppercase" }}>
                {msg.role === "user" ? "You" : "Assistant"}
              </div>

              <div style={{
                maxWidth: "75%",
                background: msg.role === "user" ? "linear-gradient(135deg, #6366f122, #a78bfa22)" : "#ffffff08",
                border: `1px solid ${msg.role === "user" ? "#6366f144" : "#ffffff15"}`,
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "14px 20px",
                color: "#ffffffdd",
                fontSize: 14,
                lineHeight: 1.7,
                backdropFilter: "blur(10px)",
              }}>
                {msg.content}
              </div>

              {msg.sources?.length > 0 && (
                <div style={{ marginTop: 10, width: "75%", display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 10, color: "#ffffff33", letterSpacing: 2, fontFamily: "'Orbitron', monospace" }}>
                    {msg.sources.length} SOURCES
                  </div>
                  {msg.sources.map((src, j) => (
                    <div key={j} className="source-card" style={{
                      background: "#ffffff05",
                      border: "1px solid #ffffff15",
                      borderRadius: 10,
                      padding: "10px 14px",
                      cursor: "default",
                      transition: "all 0.2s",
                    }}>
                      <div style={{ fontSize: 11, color: "#6366f1", fontFamily: "'Orbitron', monospace", marginBottom: 4 }}>
                        {src.filename} · page {src.page}
                      </div>
                      <div style={{ fontSize: 12, color: "#ffffff44", lineHeight: 1.5 }}>
                        {src.content}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="msg-appear" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: "50%", background: "#6366f1",
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 12, color: "#ffffff33", letterSpacing: 1 }}>Searching documents...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "20px 0 36px", flexShrink: 0, width: "100%" }}>
          <div className="glow" style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            background: "#ffffff08",
            border: "1px solid #ffffff18",
            borderRadius: 16,
            padding: "8px 8px 8px 20px",
            backdropFilter: "blur(20px)",
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && ask()}
              placeholder="Ask anything about your documents..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: 15,
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: 0.3,
              }}
            />
            <button
              className="send-btn"
              onClick={ask}
              disabled={loading}
              style={{
                background: loading ? "#ffffff11" : "#6366f1",
                border: "none",
                borderRadius: 12,
                width: 44,
                height: 44,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 18,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              {loading ? "⏳" : "↑"}
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "#ffffff22", letterSpacing: 1 }}>
            Running on Groq · llama-3.3-70b · Local ChromaDB
          </div>
        </div>
      </div>
    </div>
  );
}