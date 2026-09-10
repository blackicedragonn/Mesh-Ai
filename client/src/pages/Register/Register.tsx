import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useFormWithValidation } from "../../hooks/useFormWithValidation";
import { registerUser } from "../../utils/api";
import logo from "../../assets/logo.svg";

function getNavLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? "form__nav-link form__nav-link_active" : "form__nav-link";
}

export default function Register() {
  const { values, errors, isValid, handleChange } = useFormWithValidation({
    name: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;
    setStatus("");
    try {
      await registerUser(values.name, values.email, values.password);
      navigate("/login");
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
        <h1 className="form__title">Create your account</h1>
        <p className="form__subtitle">Sign up to start building your knowledge base.</p>

        <nav className="form__nav">
          <NavLink to="/login" className={getNavLinkClass}>
            Login
          </NavLink>
          <NavLink to="/register" className={getNavLinkClass}>
            Register
          </NavLink>
        </nav>

        <div className="form__field">
          <label className="form__label" htmlFor="name">
            Name
          </label>
          <input
            className="form__input"
            id="name"
            name="name"
            type="text"
            minLength={2}
            maxLength={40}
            required
            value={values.name ?? ""}
            onChange={handleChange}
          />
          {errors.name && <span className="form__error">{errors.name}</span>}
        </div>

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
          Register
        </button>

        <p className="form__status">{status}</p>
      </form>
    </div>
  );
}
