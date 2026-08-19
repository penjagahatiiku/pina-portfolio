'use client';

import { FormEvent, useState } from 'react';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import styles from './ChatBot.module.css';

type Message = { role: 'user' | 'assistant'; content: string };

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Halo! Saya bot PINA. Ada yang ingin Anda tanyakan tentang layanan kami?' },
  ]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;
    setInput('');
    setMessages((current) => [...current, { role: 'user', content: message }]);
    setLoading(true);
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal menghubungi bot.');
      setMessages((current) => [...current, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', content: error instanceof Error ? error.message : 'Maaf, bot sedang tidak tersedia.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {open && <section className={styles.panel} aria-label="Chat dengan bot PINA">
        <header className={styles.header}><div className={styles.title}><Bot size={18} /> PINA AI Assistant</div><button className={styles.close} onClick={() => setOpen(false)} aria-label="Tutup chat"><X size={18} /></button></header>
        <div className={styles.messages} aria-live="polite">
          {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`${styles.message} ${message.role === 'user' ? styles.user : styles.assistant}`}>{message.content}</div>)}
          {loading && <div className={`${styles.message} ${styles.assistant}`}>Sedang mengetik…</div>}
        </div>
        <form className={styles.form} onSubmit={sendMessage}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Tulis pesan…" aria-label="Pesan chat" maxLength={1000} /><button type="submit" aria-label="Kirim pesan" disabled={loading || !input.trim()}><Send size={17} /></button></form>
      </section>}
      <button className={styles.floating} onClick={() => setOpen((current) => !current)} aria-label={open ? 'Tutup chat bot' : 'Buka chat bot'}>{open ? <X size={23} /> : <MessageCircle size={23} />}</button>
    </div>
  );
}
