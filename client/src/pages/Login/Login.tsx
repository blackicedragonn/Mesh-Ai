import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useFormWithValidation } from "../../hooks/useFormWithValidation";
import { useAuth } from "../../contexts/AuthContext";
import { loginUser } from "../../utils/api";
import logo from "../../assets/logo.svg";

function getNavLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? "form__nav-link form__nav-link_active" : "form__nav-link";
}

type LocationState = {
  from?: { pathname: string };
};

export default function Login() {
  const { values, errors, isValid, handleChange } = useFormWithValidation({
    email: "",
    password: "",
  });
  const [status, setStatus] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;
    setStatus("");
    try {
      const res = await loginUser(values.email, values.password);
      if (res.data) {
        login(res.data.token, res.data.user);
        const state = location.state as LocationState | null;
        const redirectTo = state?.from?.pathname ?? "/knowledge";
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="form-page">
      <header className="header">
        <img className="header__logo" alt="MeshAI logo" src={logo} />
      </header>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <h1 className="form__title">Welcome back</h1>
        <p className="form__subtitle">Log in to continue to your knowledge base.</p>

        <nav className="form__nav">
          <NavLink to="/login" className={getNavLinkClass}>
            Login
          </NavLink>
          <NavLink to="/register" className={getNavLinkClass}>
            Register
          </NavLink>
        </nav>

        <div className="form__field">
          <label className="form__label" htmlFor="email">
            Email
          </label>
          <input
            className="form__input"
            id="email"
            name="email"
            type="email"
            required
            value={values.email ?? ""}
            onChange={handleChange}
          />
          {errors.email && <span className="form__error">{errors.email}</span>}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="password">
            Password
          </label>
          <input
            className="form__input"
            id="password"
            name="password"
            type="password"
            minLength={8}
            required
            value={values.password ?? ""}
            onChange={handleChange}
          />
          {errors.password && (
            <span className="form__error">{errors.password}</span>
          )}
        </div>

        <button className="form__submit" type="submit" disabled={!isValid}>
          Login
        </button>

        <p className="form__status">{status}</p>
      </form>
    </div>
  );
}
