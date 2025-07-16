import React, { useState } from 'react';
import { Modal, Box, TextField, MenuItem } from '@mui/material';
import styles from "./ModalElegirMaquina.module.scss";
import { Maquina } from '@/domain/models/Maquina';

interface Props {
    open: boolean;
    setModalClose: () => void;
    maquinas: Maquina[];
    handleSelectMaquina: (maquina: Maquina) => void;
}

const ModalElegirMaquina: React.FC<Props> = ({ open, setModalClose, maquinas, handleSelectMaquina }) => {
    const [selectedMaquina, setSelectedMaquina] = useState<string>("");

    const customInputSx = {
        '& .MuiInputBase-root': {
            borderRadius: '10px',
            backgroundColor: '#e6ebea',
            paddingX: 1,
            fontWeight: 'bold',
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#404e5c',
            borderWidth: '2px',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#404e5c',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#404e5c',
        },
        '& .MuiInputLabel-root': {
            fontWeight: 'bold',
            color: '#404e5c',
        },
        '&.Mui-focused .MuiInputLabel-root': {
            color: '#404e5c',
        },
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedMaquina !== "" && maquinas) {
            const maquina = maquinas.find(m => m.id === selectedMaquina);
            if (maquina) {
                handleSelectMaquina(maquina);
                setModalClose();
                setSelectedMaquina("");
            } else {
                alert("Error al seleccionar la máquina");
            }
        }
    };

    return (
        <Modal
            open={open}
            onClose={setModalClose}
            aria-labelledby="modal-modal-title"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: {
                        xs: '95%',
                        sm: '400px'
                    },
                    bgcolor: '#f5f7f6',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 8,
                    border: '3px solid #404e5c',
                }}
            >
                <h3 className={styles.title}>Seleccione la maquina a utilizar</h3>
                <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                select
                                name="maquina"
                                value={selectedMaquina}
                                onChange={(e) => setSelectedMaquina(e.target.value)}
                                label="Seleccione una máquina"
                                variant="outlined"
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                        backgroundColor: '#e6ebea',
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#404e5c',
                                    },
                                }}
                            > 
                                {maquinas.map((m) => (
                                    <MenuItem key={m.id} value={m.id}>
                                        {m.name}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {selectedMaquina && (
                                <>
                                    <TextField
                                        fullWidth
                                        label="Patente"
                                        value={maquinas.find(m => m.id === selectedMaquina)?.internal_plate || ''}
                                        InputProps={{ readOnly: true }}
                                        sx={{
                                            mt: 2,
                                            ...customInputSx
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Modelo"
                                        value={maquinas.find(m => m.id === selectedMaquina)?.model || ''}
                                        InputProps={{ readOnly: true }}
                                        sx={{
                                            mt: 2,
                                            ...customInputSx
                                        }}
                                    />
                                </>
                            )}

                    <div className={styles.buttonContainer}>
                        <button
                            type="button"
                            className={`button ${styles.buttonCancel}`}
                            onClick={setModalClose}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`button ${styles.buttonFinish}`}
                            disabled={selectedMaquina === "" || !maquinas}
                        >
                            Iniciar
                        </button>
                    </div>
                </form>
            </Box>
        </Modal>
    );
};

export default ModalElegirMaquina;
