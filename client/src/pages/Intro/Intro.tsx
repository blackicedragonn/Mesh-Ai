import { useNavigate } from "react-router-dom";
import iconUpload from "../../assets/icon-upload.svg";
import iconChat from "../../assets/icon-chat.svg";
import iconAnswers from "../../assets/icon-answers.svg";
import "./Intro.css";

const features = [
  {
    icon: iconUpload,
    title: "Upload documents",
    description: "Add PDFs to build your own searchable knowledge base.",
  },
  {
    icon: iconChat,
    title: "Ask questions",
    description: "Chat naturally about the content you've uploaded.",
  },
  {
    icon: iconAnswers,
    title: "Get instant answers",
    description: "Receive accurate answers grounded in your own documents.",
  },
];

export default function Intro() {
  const navigate = useNavigate();

  return (
    <div className="intro">
      <h1 className="intro__heading">Welcome to Mesh AI</h1>
      <p className="intro__subheading">
        Turn your documents into an AI-powered knowledge base you can talk to.
      </p>
      <div className="intro__cards">
        {features.map((feature) => (
          <div className="intro__card" key={feature.title}>
            <img src={feature.icon} alt="" className="intro__card-icon" />
            <h2 className="intro__card-title">{feature.title}</h2>
            <p className="intro__card-description">{feature.description}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="intro__start"
        onClick={() => navigate("/knowledge")}
      >
        Start
      </button>
    </div>
  );
}
