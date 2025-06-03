import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Autocomplete,
    Snackbar,
    Alert
} from '@mui/material';
import { predefinedSkills, predefinedTechStack } from '../pages/Miperfil';

const PortfolioEditor = ({ open, handleClose, portfolio, setPortfolio }) => {
  /*
  // Estado temporal para almacenar los cambios en el portafolio durante la edición
  const [tempData, setTempData] = useState({
    skills: portfolio.skills || [],
    studies: portfolio.studies || [],
    experience: portfolio.experience || [],
    linkedin: portfolio.linkedin || '',
    techStack: portfolio.techStack || []
  });
  
  // Estado para gestionar las notificaciones (éxito/error)
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });
  
  // Función para actualizar los campos del portafolio
  const handleFieldChange = (field, value) => {
    setTempData(prev => ({ ...prev, [field]: value }));
  };

  // Función para guardar los cambios en el portafolio (envío al backend)
  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempData)
      });
      if (!response.ok) throw new Error('Error al actualizar el perfil');
      setPortfolio({ ...tempData });
      setSnackbar({ open: true, severity: 'success', message: 'Perfil actualizado correctamente' });
      handleClose();
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, severity: 'error', message: 'Error al actualizar el perfil' });
    }
  };
  */

  return (
    <>
      {/*
      // Componente Dialog para editar el portafolio (comentado para deshabilitar)
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Editar Portafolio</DialogTitle>
        <DialogContent dividers>
          {/* Campo para editar habilidades *\/}
          <Autocomplete
            multiple
            options={predefinedSkills || ["React", "Angular", "SQL", "Node.js", "Python", "Docker", "AWS", "Firebase", "Java", "C++"]}
            value={tempData.skills}
            onChange={(event, newValue) => handleFieldChange("skills", newValue)}
            renderInput={(params) => <TextField {...params} label="Habilidades técnicas" margin="normal" />}
          />
          {/* Campo para editar estudios *\/}
          <TextField
            label="Estudios (Ej.: 'Ingeniería en Sistemas - Univ. X (2022)')"
            fullWidth
            margin="normal"
            value={tempData.studies.join('; ')}
            onChange={(e) => handleFieldChange("studies", e.target.value.split(';').map(s => s.trim()))}
          />
          {/* Campo para editar experiencia laboral *\/}
          <TextField
            label="Experiencia laboral (Ej.: 'Empresa Y - Desarrollador (2 años)')"
            fullWidth
            margin="normal"
            value={tempData.experience.join('; ')}
            onChange={(e) => handleFieldChange("experience", e.target.value.split(';').map(s => s.trim()))}
          />
          {/* Campo para editar URL de LinkedIn *\/}
          <TextField
            label="URL de LinkedIn"
            type="url"
            fullWidth
            margin="normal"
            value={tempData.linkedin}
            onChange={(e) => handleFieldChange("linkedin", e.target.value)}
          />
          {/* Campo para editar el stack tecnológico *\/}
          <Autocomplete
            multiple
            options={predefinedTechStack || ["React", "Node.js", "Firebase", "Docker", "AWS", "Python", "Java", "Angular"]}
            value={tempData.techStack}
            onChange={(event, newValue) => handleFieldChange("techStack", newValue)}
            renderInput={(params) => <TextField {...params} label="Stack Tecnológico" margin="normal" />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>Guardar cambios</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      */}
      {/* Mensaje indicando que la edición del portafolio está deshabilitada */}
      
    </>
  );
};

export default PortfolioEditor;