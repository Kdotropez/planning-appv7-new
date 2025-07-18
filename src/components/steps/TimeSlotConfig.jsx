﻿import React from 'react';
import { format, isAfter, parse } from 'date-fns';
import Button from '../common/Button';
import { saveToLocalStorage } from '../../utils/localStorage';
import '@/assets/styles.css';

const TimeSlotConfig = ({ config, setConfig, setStep, setFeedback }) => {
    const intervals = [15, 30, 60];
    const startTimeOptions = ['09:00', '09:30', '10:00', 'other'];
    const endTimeOptions = ['19:00', '20:00', '22:00', '23:00', '00:00', '01:00', '02:00', '03:00', 'other'];

    const validateTimeFormat = (time) => {
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$|^24:00$|^0[0-3]:[0-5][0-9]$/;
        return timeRegex.test(time);
    };

    const generateTimeSlots = (start, end, interval) => {
        if (!start || !end || !interval) return [];
        const startDate = parse(start, 'HH:mm', new Date(2025, 0, 1));
        const endDate = ['00:00', '01:00', '02:00', '03:00'].includes(end) 
            ? parse(end === '00:00' ? '00:00' : end, 'HH:mm', new Date(2025, 0, 2))
            : parse(end, 'HH:mm', new Date(2025, 0, 1));
        if (!isAfter(endDate, startDate)) return [];
        const slots = [];
        let current = startDate;
        while (current < endDate) {
            slots.push(format(current, 'HH:mm'));
            current = new Date(current.getTime() + interval * 60 * 1000);
        }
        return slots;
    };

    const handleNext = () => {
        if (!config.startTime || !config.endTime) {
            return; // Supprimé : setFeedback('Erreur: Veuillez sélectionner une heure de début et de fin.');
        }
        if (!validateTimeFormat(config.startTime)) {
            return; // Supprimé : setFeedback('Erreur: Heure de début invalide (HH:mm).');
        }
        if (!validateTimeFormat(config.endTime)) {
            return; // Supprimé : setFeedback('Erreur: Heure de fin invalide (HH:mm).');
        }
        const startTime = config.startTime === 'other' ? config.startTimeCustom : config.startTime;
        const endTime = config.endTime === 'other' ? config.endTimeCustom : config.endTime;
        if (!startTime || !endTime) {
            return; // Supprimé : setFeedback('Erreur: Veuillez spécifier une heure personnalisée pour l\'option "Autre".');
        }
        const timeSlots = generateTimeSlots(startTime, endTime, config.interval);
        if (timeSlots.length === 0) {
            return; // Supprimé : setFeedback('Erreur: Aucun créneau horaire défini.');
        }
        const updatedConfig = { ...config, timeSlots, startTime, endTime };
        saveToLocalStorage('timeSlotConfig', updatedConfig);
        setConfig(updatedConfig);
        setStep(2);
        // Supprimé : setFeedback('Succès: Configuration des tranches enregistrée.');
    };

    const handleReset = () => {
        const defaultConfig = { 
            timeSlots: generateTimeSlots('09:00', '01:00', 30), 
            interval: 30, 
            startTime: '09:00', 
            endTime: '01:00', 
            startTimeCustom: '', 
            endTimeCustom: '' 
        };
        setConfig(defaultConfig);
        saveToLocalStorage('timeSlotConfig', defaultConfig);
        // Supprimé : setFeedback('Succès: Configuration réinitialisée.');
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.config || !Array.isArray(data.config.timeSlots) || !data.config.interval || !data.config.startTime || !data.config.endTime) {
                    return; // Supprimé : setFeedback('Erreur: Données de configuration invalides dans le fichier importé.');
                }
                setConfig(data.config);
                saveToLocalStorage('timeSlotConfig', data.config);
                // Supprimé : setFeedback('Succès: Configuration importée avec succès.');
            } catch (error) {
                console.error('Erreur lors de l\'importation:', error);
                // Supprimé : setFeedback('Erreur: Échec de l\'importation du fichier JSON.');
            }
        };
        reader.readAsText(file);
    };

    const handleExport = () => {
        const data = { config };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `config_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        // Supprimé : setFeedback('Succès: Configuration exportée avec succès.');
    };

    console.log('Rendering TimeSlotConfig with config:', config);

    return (
        <div className="step-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'Roboto, sans-serif', textAlign: 'center', marginBottom: '15px' }}>
                Configuration des tranches horaires
            </h2>
            <div className="button-group" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                <Button className="button-validate" onClick={handleExport}>
                    Exporter
                </Button>
                <Button className="button-validate">
                    Importer
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        style={{ display: 'none' }}
                    />
                </Button>
            </div>
            <div className="form-group" style={{ marginBottom: '15px', width: '100%', maxWidth: '400px' }}>
                <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', marginBottom: '5px', display: 'block', textAlign: 'center' }}>
                    Intervalle (minutes)
                </label>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {intervals.map((int) => (
                        <label
                            key={int}
                            style={{
                                fontFamily: 'Roboto, sans-serif',
                                border: '1px solid #d6e6ff',
                                backgroundColor: config.interval === int ? '#e0e0e0' : '#f0f0f0',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = config.interval === int ? '#e0e0e0' : '#f0f0f0'}
                        >
                            <input
                                type="radio"
                                name="interval"
                                value={int}
                                checked={config.interval === int}
                                onChange={(e) => setConfig({ ...config, interval: Number(e.target.value) })}
                                style={{ marginRight: '4px' }}
                            />
                            {int} min
                        </label>
                    ))}
                </div>
            </div>
            <div className="form-group" style={{ marginBottom: '15px', width: '100%', maxWidth: '400px' }}>
                <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', marginBottom: '5px', display: 'block', textAlign: 'center' }}>
                    Heure de début
                </label>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {startTimeOptions.map((time) => (
                        <label
                            key={time}
                            style={{
                                fontFamily: 'Roboto, sans-serif',
                                border: '1px solid #d6e6ff',
                                backgroundColor: config.startTime === time ? '#e0e0e0' : '#f0f0f0',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = config.startTime === time ? '#e0e0e0' : '#f0f0f0'}
                        >
                            <input
                                type="radio"
                                name="startTime"
                                value={time}
                                checked={config.startTime === time}
                                onChange={(e) => setConfig({ ...config, startTime: e.target.value })}
                                style={{ marginRight: '4px' }}
                            />
                            {time === 'other' ? 'Autre' : time}
                        </label>
                    ))}
                </div>
                {config.startTime === 'other' && (
                    <input
                        type="time"
                        value={config.startTimeCustom || ''}
                        onChange={(e) => setConfig({ ...config, startTimeCustom: e.target.value, startTime: e.target.value })}
                        style={{ padding: '10px', fontSize: '16px', width: '100%', marginTop: '10px' }}
                    />
                )}
            </div>
            <div className="form-group" style={{ marginBottom: '15px', width: '100%', maxWidth: '400px' }}>
                <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', marginBottom: '5px', display: 'block', textAlign: 'center' }}>
                    Heure de fin
                </label>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {endTimeOptions.map((time) => (
                        <label
                            key={time}
                            style={{
                                fontFamily: 'Roboto, sans-serif',
                                border: '1px solid #d6e6ff',
                                backgroundColor: config.endTime === time ? '#e0e0e0' : '#f0f0f0',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = config.endTime === time ? '#e0e0e0' : '#f0f0f0'}
                        >
                            <input
                                type="radio"
                                name="endTime"
                                value={time}
                                checked={config.endTime === time}
                                onChange={(e) => setConfig({ ...config, endTime: e.target.value })}
                                style={{ marginRight: '4px' }}
                            />
                            {time === 'other' ? 'Autre' : time}
                        </label>
                    ))}
                </div>
                {config.endTime === 'other' && (
                    <input
                        type="time"
                        value={config.endTimeCustom || ''}
                        onChange={(e) => setConfig({ ...config, endTimeCustom: e.target.value, endTime: e.target.value })}
                        style={{ padding: '10px', fontSize: '16px', width: '100%', marginTop: '10px' }}
                    />
                )}
            </div>
            <div className="button-group" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                <Button className="button-validate" onClick={handleNext}>
                    Valider
                </Button>
                <Button className="button-reinitialiser" onClick={handleReset}>
                    Réinitialiser
                </Button>
            </div>
            <p style={{ fontFamily: 'Roboto, sans-serif', textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#333' }}>
                Klick-Planning - copyright © Nicolas Lefevre
            </p>
        </div>
    );
};

export default TimeSlotConfig;