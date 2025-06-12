'use client';

import { useState, useEffect } from 'react';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed bottom-4 right-4 py-3 px-6 rounded-lg shadow-lg transform transition-all duration-500 translate-y-0 opacity-100"
      style={{
        backgroundColor: type === 'error' ? '#64543f' : '#86755e',
        color: '#cab69d',
        animation: 'slideIn 0.5s ease-out'
      }}
    >
      {message}
    </div>
  );
}

export default function Home() {
  const [hasPhotos, setHasPhotos] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', show: false });
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    checkExistingPhotos();
  }, []);

  const checkExistingPhotos = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/existe`, {
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      setHasPhotos(response.status === 200);
    } catch (error) {
      setToast({ message: 'Erro ao verificar fotos', type: 'error', show: true });
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 100) {
      setToast({ message: 'Máximo de 100 fotos permitido', type: 'error', show: true });
      return;
    }
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setToast({ message: 'Selecione pelo menos uma foto', type: 'error', show: true });
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('fotos', file);
    });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fotos`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors'
      });

      const data = await response.json();
      
      if (response.ok) {
        setToast({ message: data.message, type: 'success', show: true });
        setSelectedFiles([]);
        await checkExistingPhotos();
      } else {
        setToast({ message: data.error, type: 'error', show: true });
      }
    } catch (error) {
      setToast({ message: 'Erro ao enviar fotos', type: 'error', show: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fotos`, {
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao baixar fotos');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fotos.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      await checkExistingPhotos();      } catch (error) {
      setToast({ message: error.message, type: 'error', show: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 flex flex-col items-center justify-center" style={{ backgroundColor: '#cab69d' }}>
      <div className="w-full max-w-md rounded-xl shadow-2xl p-8" style={{ backgroundColor: '#423420' }}>
        <h1 className="text-3xl font-bold text-center mb-8" style={{ color: '#cab69d' }}>
          PhotoSolution
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#cab69d' }}></div>
          </div>
        ) : hasPhotos ? (
          <div className="text-center">
            <p className="mb-6" style={{ color: '#cab69d' }}>Fotos disponíveis para download</p>
            <button
              onClick={handleDownload}
              className="w-full py-4 px-6 rounded-lg font-semibold transform hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: '#86755e', color: '#cab69d' }}
            >
              Baixar Fotos
            </button>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <label
              htmlFor="photos"
              className="block w-full border-2 border-dashed rounded-lg p-8 cursor-pointer transition-all duration-200 hover:scale-105"
              style={{ borderColor: '#a8957e', color: '#cab69d' }}
            >
              <span className="block text-xl mb-2">Selecione as fotos</span>
              <span className="block text-sm opacity-75">Máximo de 100 fotos</span>
              {selectedFiles.length > 0 && (
                <span className="block mt-4 text-lg" style={{ color: '#cab69d' }}>
                  {selectedFiles.length} foto{selectedFiles.length !== 1 ? 's' : ''} selecionada{selectedFiles.length !== 1 ? 's' : ''}
                </span>
              )}
            </label>
            
            <input
              type="file"
              id="photos"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFiles.length > 0 && (
              <button
                onClick={handleUpload}
                className="w-full py-4 px-6 rounded-lg font-semibold transform hover:scale-105 transition-all duration-200"
                style={{ backgroundColor: '#86755e', color: '#cab69d' }}
              >
                Enviar Fotos
              </button>
            )}
          </div>
        )}

      </div>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </main>
  );
}
