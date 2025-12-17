import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

function LoginPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      localStorage.setItem('userEmail', res.data.user.email);
      localStorage.setItem('userName', res.data.user.name);

      navigate('/');
    } catch (err) {
      console.error('Login error', err);
      setError('Невірний email або пароль');
    }
  };

  return (
    <div className="public-content">
      <div className="auth-card">
        <h1 className="auth-title">Вхід</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email</label>
            <input
              className="order-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label>Пароль</label>
            <input
              className="order-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="order-error">{error}</div>}
          <button type="submit" className="btn-primary">
            Увійти
          </button>
        </form>

        <p className="auth-bottom-text">
          Немає акаунта? <Link to="/register">Зареєструватися</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
