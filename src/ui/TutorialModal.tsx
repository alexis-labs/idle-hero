import { X, Map, Hammer, Sword, Zap } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

export function TutorialModal({ onClose }: TutorialModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-panel"
        style={{ maxWidth: '600px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-title-row"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}
        >
          <h2 style={{ margin: 0, color: 'var(--cyan)' }}>Idle Hero - Qanday O'ynaladi?</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#cbd5e1' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ color: 'var(--rose)' }}><Map size={32} /></div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>1. Kashfiyot (Exploration)</h3>
              <p style={{ margin: 0 }}>Xaritada qora hududlarni ochib boring. "Travel" tugmasi orqali yangi joylarga borish, puzllarni yechish va boyliklar topish mumkin.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ color: 'var(--mint)' }}><Hammer size={32} /></div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>2. Ko'nikmalar (Skills) va Resurslar</h3>
              <p style={{ margin: 0 }}>Daraxt kesish, konchilik qilish orqali kerakli resurslarni to'plang. Siz ulardan turli qurollar, jihozlar yasashingiz va ovqat pishirishingiz mumkin. "Bank" bo'limida ularni saqlash mumkin.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ color: 'var(--violet)' }}><Sword size={32} /></div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>3. Jang Tizimi (Combat)</h3>
              <p style={{ margin: 0 }}>Maxluqlarga duch kelganda jang qiling. O'zingizga qulay qurol va zirhlarni kiyib oling. Shuningdek, ovqat yeyish orqali joningizni tiklab turishni unutmang!</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ color: 'var(--gold)' }}><Zap size={32} /></div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>4. Upgrade va Yutuqlar</h3>
              <p style={{ margin: 0 }}>Yig'gan tangalaringizni "Shop" orqali yangi imkoniyatlar sotib olishga sarflang. O'yindan chiqqaningizda ham (offline) taraqqiyot davom etadi!</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="primary-button" style={{ padding: '10px 24px', fontWeight: 'bold' }} onClick={onClose}>
            Tushunarli!
          </button>
        </div>
      </div>
    </div>
  );
}
