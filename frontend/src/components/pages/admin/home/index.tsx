import { useEffect, useRef, useState } from "react";
import { auth } from "../../../../firebase/config";
import {
  CommunityPhoto,
  getCommunityPhotos,
  uploadCommunityPhoto,
  updateCommunityPhoto,
} from "../community/communityApi";
import "./index.scss";

const getToken = async (): Promise<string> => {
  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error("Not signed in");
  return currentUser.getIdToken();
};

const AdminHome: React.FC = () => {
  const [heroPhoto, setHeroPhoto] = useState<CommunityPhoto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroUploading, setHeroUploading] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  const loadHeroPhoto = async () => {
    setLoading(true);
    setError(null);
    try {
      const heroList = await getCommunityPhotos("hero");
      setHeroPhoto(heroList[0] ?? null);
    } catch (err) {
      setError((err as Error).message || "Failed to load hero photo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHeroPhoto();
  }, []);

  const handleHeroFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setHeroUploading(true);
    setError(null);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("image", file);

      const saved = heroPhoto
        ? await updateCommunityPhoto(token, heroPhoto._id, formData)
        : await uploadCommunityPhoto(
            token,
            (() => {
              formData.append("section", "hero");
              return formData;
            })(),
          );
      setHeroPhoto(saved);
    } catch (err) {
      setError((err as Error).message || "Failed to upload hero photo");
    } finally {
      setHeroUploading(false);
    }
  };

  return (
    <div className="admin-home">
      {error && <p className="admin-home__error">{error}</p>}

      <div className="admin-home__card">
        <div className="admin-home__card-header">
          <span className="admin-home__card-title">Hero photo</span>
        </div>
        <div className="admin-home__hero">
          {loading ? (
            <div
              className="admin-home__hero-image admin-home__hero-image--empty"
              aria-hidden="true"
            />
          ) : heroPhoto ? (
            <img
              className="admin-home__hero-image"
              src={heroPhoto.imageUrl}
              alt="Hero"
            />
          ) : (
            <div
              className="admin-home__hero-image admin-home__hero-image--empty"
              aria-hidden="true"
            />
          )}
          <div>
            <p className="admin-home__hero-caption">
              Shown at the top of the public home page.
            </p>
            <button
              className="admin-home__add-btn"
              type="button"
              onClick={() => heroFileInputRef.current?.click()}
              disabled={heroUploading}
            >
              {heroUploading
                ? "Uploading…"
                : heroPhoto
                  ? "Replace photo"
                  : "Upload photo"}
            </button>
            <input
              ref={heroFileInputRef}
              className="admin-home__hidden-file-input"
              type="file"
              accept="image/*"
              onChange={handleHeroFileChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
