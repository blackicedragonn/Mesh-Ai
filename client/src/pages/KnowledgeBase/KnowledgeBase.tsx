import { useState, useEffect } from "react";
import "./KnowledgeBase.css";
import UploadArea from "../../components/UploadArea/UploadArea";
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  type KnowledgeDoc,
} from "../../utils/api";
import removeIcon from "../../assets/icon-remove.svg";

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDocuments();
        setDocuments(res.data || []);
      } catch {
        setError('Failed to load documents.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    try {
      const res = await uploadDocument(file);
      if (res.data) {
        setDocuments((prev) => [res.data!, ...prev]);
      }
    } catch {
      setError('Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
    } catch {
      setError('Failed to delete document.');
    }
  };

  return (
    <div className="knowledge-base">
      <h1 className="knowledge-base__heading">Manage Your Knowledge Base</h1>
      <section className="knowledge-base__content">
        <p className="knowledge-base__label">Upload documents (PDF)</p>
        <UploadArea onFileSelect={handleFileSelect} isUploading={isUploading} />

        {isLoading && (
          <p className="knowledge-base__status">Loading...</p>
        )}

        {!isLoading && error && (
          <p className="knowledge-base__status knowledge-base__status_error">
            {error}
          </p>
        )}

        {!isLoading && !error && documents.length === 0 && (
          <p className="knowledge-base__status">No documents yet.</p>
        )}

        {!isLoading && !error && documents.length > 0 && (
          <ul className="knowledge-base__list">
            {documents.map((doc) => (
              <li key={doc._id} className="knowledge-base__tag">
                <span className="knowledge-base__tag-name">{doc.fileName}</span>
                <button
                  type="button"
                  className="knowledge-base__tag-remove"
                  aria-label={`Remove ${doc.fileName}`}
                  onClick={() => handleDelete(doc._id)}
                >
                  <img src={removeIcon} alt="" aria-hidden="true" width={12} height={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
