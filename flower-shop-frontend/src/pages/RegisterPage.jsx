import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        phone,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      localStorage.setItem('userEmail', res.data.user.email);
      localStorage.setItem('userName', res.data.user.name);

      navigate('/');
    } catch (err) {
      console.error('Register error', err);
      setError('Не вдалося зареєструватися (можливо, email вже існує)');
    }
  };

  return (
    <div className="public-content">
      <div className="auth-card">
        <h1 className="auth-title">Реєстрація</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Імʼя</label>
            <input
              className="order-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
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
            <label>Телефон</label>
            <input
              className="order-input"
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
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
            Зареєструватися
          </button>
        </form>

        <p className="auth-bottom-text">
          Вже є акаунт? <Link to="/login">Увійти</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
