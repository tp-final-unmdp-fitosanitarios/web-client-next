"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Modal, Typography, IconButton } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import styles from './CameraCapture.module.scss';

interface CameraCaptureProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (base64Data: string, fileName: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [isOpen]);

    const startCamera = async () => {
        setError(null);
        setIsCameraActive(false);
        
        try {
            // First try with rear camera preference
            let mediaStream;
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    } 
                });
            } catch (error) {
                console.log('Rear camera failed, trying front camera:', error);
                // Fallback to front camera
                mediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: 'user',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    } 
                });
            }
            
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                
                // Wait for video to be ready
                await new Promise((resolve) => {
                    if (videoRef.current) {
                        videoRef.current.onloadedmetadata = () => {
                            videoRef.current?.play();
                            resolve(true);
                        };
                    }
                });
                
                setStream(mediaStream);
                setIsCameraActive(true);
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Error accessing camera:', error);
            
            let errorMessage = 'No se pudo acceder a la cámara.';
            
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Permiso denegado para acceder a la cámara. Por favor, permita el acceso a la cámara en su navegador.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'No se encontró ninguna cámara en el dispositivo.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage = 'Su navegador no soporta el acceso a la cámara.';
            } else if (error.name === 'NotReadableError') {
                errorMessage = 'La cámara está siendo utilizada por otra aplicación.';
            }
            
            setError(errorMessage);
            alert(errorMessage);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsCameraActive(false);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCapturedImage(null);
        setError(null);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
    };

    const retakePhoto = () => {
        setCapturedImage(null);
    };

    const confirmPhoto = () => {
        if (capturedImage) {
            // Remove the data URL prefix to get just the base64 data
            const base64Data = capturedImage.split(',')[1];
            const fileName = `camera_capture_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`;
            onCapture(base64Data, fileName);
            onClose();
        }
    };

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    const retryCamera = () => {
        stopCamera();
        setTimeout(() => {
            startCamera();
        }, 100);
    };

    return (
        <Modal open={isOpen} onClose={handleClose}>
            <Box className={styles.modalContainer}>
                <Box className={styles.modalContent}>
                    <Box className={styles.header}>
                        <Typography variant="h6" className={styles.title}>
                            Tomar Foto
                        </Typography>
                        <IconButton onClick={handleClose} className={styles.closeButton}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Box className={styles.cameraContainer}>
                        {!capturedImage ? (
                            <>
                                <video
                                    ref={videoRef}
                                    className={styles.video}
                                    autoPlay
                                    playsInline
                                    muted
                                />
                                {!isCameraActive && !error && (
                                    <Box className={styles.cameraPlaceholder}>
                                        <CameraAltIcon className={styles.cameraIcon} />
                                        <Typography>Iniciando cámara...</Typography>
                                    </Box>
                                )}
                                {error && (
                                    <Box className={styles.errorContainer}>
                                        <Typography className={styles.errorText}>
                                            {error}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            onClick={retryCamera}
                                            className={styles.retryButton}
                                        >
                                            Reintentar
                                        </Button>
                                    </Box>
                                )}
                                {/* Hidden canvas for capturing */}
                                <canvas
                                    ref={canvasRef}
                                    style={{ display: 'none' }}
                                />
                            </>
                        ) : (
                            <img 
                                src={capturedImage} 
                                alt="Captured" 
                                className={styles.capturedImage}
                            />
                        )}
                    </Box>

                    <Box className={styles.buttonContainer}>
                        {!capturedImage ? (
                            <Button
                                variant="contained"
                                onClick={capturePhoto}
                                disabled={!isCameraActive || !!error}
                                className={styles.captureButton}
                                startIcon={<CameraAltIcon />}
                            >
                                Capturar Foto
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outlined"
                                    onClick={retakePhoto}
                                    className={styles.retakeButton}
                                >
                                    Volver a tomar
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={confirmPhoto}
                                    className={styles.confirmButton}
                                >
                                    Confirmar
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

export default CameraCapture; 