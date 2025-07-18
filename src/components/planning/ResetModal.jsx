import React, { useState } from 'react';
import { format, addDays, isMonday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { saveToLocalStorage, loadFromLocalStorage } from '../../utils/localStorage';
import Button from '../common/Button';
import '@/assets/styles.css';

const ResetModal = ({ showResetModal, setShowResetModal, config, selectedShop, selectedWeek, selectedEmployees, planning, setPlanning, setFeedback, setAvailableWeeks }) => {
    const [resetEmployee, setResetEmployee] = useState('');

    const confirmReset = () => {
        console.log('Confirm reset:', { resetEmployee, selectedShop, selectedWeek });
        if (!resetEmployee) {
            setFeedback('Veuillez sélectionner une option.');
            return;
        }
        if (!config?.timeSlots?.length) {
            setFeedback('Erreur: Configuration des tranches horaires non valide.');
            return;
        }
        if (!selectedEmployees || selectedEmployees.length === 0) {
            setFeedback('Aucun employé sélectionné.');
            return;
        }
        setPlanning(prev => {
            const updatedPlanning = { ...prev };
            const storedSelectedEmployees = loadFromLocalStorage(`selected_employees_${selectedShop}_${selectedWeek}`, selectedEmployees || []);
            if (resetEmployee === 'all') {
                storedSelectedEmployees.forEach(employee => {
                    updatedPlanning[employee] = {};
                    for (let i = 0; i < 7; i++) {
                        const dayKey = format(addDays(new Date(selectedWeek), i), 'yyyy-MM-dd');
                        updatedPlanning[employee][dayKey] = Array(config.timeSlots.length).fill(false);
                    }
                });
            } else {
                updatedPlanning[resetEmployee] = {};
                for (let i = 0; i < 7; i++) {
                    const dayKey = format(addDays(new Date(selectedWeek), i), 'yyyy-MM-dd');
                    updatedPlanning[resetEmployee][dayKey] = Array(config.timeSlots.length).fill(false);
                }
            }
            console.log('Reset planning:', updatedPlanning);
            setFeedback(`Planning réinitialisé pour ${resetEmployee === 'all' ? 'tous les employés' : resetEmployee}.`);
            saveToLocalStorage(`planning_${selectedShop}_${selectedWeek}`, updatedPlanning);
            console.log('Saved planning to localStorage after reset:', { key: `planning_${selectedShop}_${selectedWeek}`, planning: updatedPlanning });
            setAvailableWeeks(prev => {
                const weeks = prev.slice();
                const currentWeekKey = format(new Date(selectedWeek), 'yyyy-MM-dd');
                if (isMonday(new Date(selectedWeek))) {
                    saveToLocalStorage(`planning_${selectedShop}_${currentWeekKey}`, updatedPlanning);
                    const weekExists = weeks.some(week => week.key === currentWeekKey);
                    if (!weekExists) {
                        weeks.push({
                            key: currentWeekKey,
                            date: new Date(selectedWeek),
                            display: `Semaine du ${format(new Date(selectedWeek), 'd MMMM yyyy', { locale: fr })}`
                        });
                        console.log(`Added current week to available weeks: ${currentWeekKey}`, updatedPlanning);
                    }
                }
                weeks.sort((a, b) => a.date - b.date);
                console.log('Available weeks:', weeks);
                return weeks;
            });
            return updatedPlanning;
        });
        setShowResetModal(false);
        setResetEmployee('');
        console.log('Reset completed, staying in PlanningDisplay');
    };

    const handleClose = () => {
        console.log('Closing ResetModal, showResetModal:', showResetModal);
        setShowResetModal(false);
        setResetEmployee('');
    };

    if (!showResetModal) return null;

    return (
        <div className="modal-overlay" style={{ pointerEvents: 'auto' }}>
            <div className="modal-content">
                <button className="modal-close" onClick={handleClose} style={{ color: '#dc3545', fontSize: '18px' }}>
                    ✕
                </button>
                <h3 style={{ fontFamily: 'Roboto, sans-serif', textAlign: 'center' }}>
                    Confirmer la réinitialisation
                </h3>
                <div className="form-group">
                    <label>Réinitialiser</label>
                    <select value={resetEmployee} onChange={(e) => setResetEmployee(e.target.value)}>
                        <option value="">Choisir une option</option>
                        <option value="all">Tous les employés</option>
                        {(loadFromLocalStorage(`selected_employees_${selectedShop}_${selectedWeek}`, selectedEmployees || []) || []).map(employee => (
                            <option key={employee} value={employee}>{employee}</option>
                        ))}
                    </select>
                </div>
                <div className="button-group">
                    <Button className="button-primary" onClick={confirmReset}>
                        Confirmer
                    </Button>
                    <Button className="button-retour" onClick={handleClose}>
                        Annuler
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ResetModal;