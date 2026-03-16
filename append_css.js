const fs = require('fs');
const css = `
/* Premium Component Classes */
.glass-card-premium {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: var(--radius-xl);
  box-shadow: 
    0 10px 30px rgba(123, 79, 46, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    inset 0 0 20px rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card-premium {
  background: rgba(255, 255, 255, 1);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card-premium:hover {
  box-shadow: 0 12px 32px rgba(123, 79, 46, 0.1);
  transform: translateY(-4px);
  border-color: rgba(201, 168, 76, 0.3);
}

.gradient-border-card {
  position: relative;
  border-radius: 1.35rem;
  background: linear-gradient(135deg, var(--color-earth) 0%, var(--color-gold) 50%, var(--color-terracotta) 100%);
  padding: 2px;
  transition: all 0.3s ease;
}

.gradient-border-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(123, 79, 46, 0.15);
}

.btn-cta-premium {
  background: linear-gradient(135deg, var(--color-earth) 0%, var(--color-earth-dark) 100%);
  color: white;
  padding: 0.875rem 2rem;
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 1.05rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(123, 79, 46, 0.25);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-cta-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(123, 79, 46, 0.35);
  background: linear-gradient(135deg, var(--color-earth-light) 0%, var(--color-earth) 100%);
}

.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(123, 79, 46, 0.12);
}

.module-icon-premium {
  width: 56px;
  height: 56px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.module-icon-premium.earth { background: linear-gradient(135deg, var(--color-earth), var(--color-earth-dark)); }
.module-icon-premium.gold { background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark)); }
.module-icon-premium.savanna { background: linear-gradient(135deg, var(--color-savanna), var(--color-savanna-dark)); }
.module-icon-premium.terracotta { background: linear-gradient(135deg, var(--color-terracotta), var(--color-terracotta-dark)); }

.tag-earth { background: rgba(123, 79, 46, 0.1); color: var(--color-earth); border: 1px solid rgba(123, 79, 46, 0.2); }
.tag-gold { background: rgba(201, 168, 76, 0.1); color: var(--color-gold-dark); border: 1px solid rgba(201, 168, 76, 0.2); }
.tag-savanna { background: rgba(45, 106, 79, 0.1); color: var(--color-savanna); border: 1px solid rgba(45, 106, 79, 0.2); }
.tag-terracotta { background: rgba(231, 111, 81, 0.1); color: var(--color-terracotta); border: 1px solid rgba(231, 111, 81, 0.2); }
`;
fs.appendFileSync('d:/Taf/JadaRiseLab/app/globals.css', '\\n' + css + '\\n');
console.log('Appended premium CSS classes to globals.css');
