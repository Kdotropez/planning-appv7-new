import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { saveToLocalStorage, loadFromLocalStorage } from '../../utils/localStorage';
import Button from '../common/Button';
import '../../assets/styles.css';

const EmployeeSelection = ({ shops, selectedShop, setSelectedShop, selectedWeek, setSelectedWeek, setSelectedEmployees, onNext }) => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeesLocal, setSelectedEmployeesLocal] = useState([]);
    const [weekInput, setWeekInput] = useState(selectedWeek ? format(new Date(selectedWeek), 'yyyy-MM-dd') : '');
    const [error, setError] = useState('');

    useEffect(() => {
        if (selectedShop) {
            // Charger tous les employés associés à la boutique depuis localStorage
            const shopEmployees = loadFromLocalStorage(`employees_${selectedShop}`, []);
            console.log(`Loaded employees for shop ${selectedShop}:`, shopEmployees);
            setEmployees(shopEmployees);
            // Charger les employés précédemment sélectionnés pour la semaine, si disponibles
            const storedSelectedEmployees = loadFromLocalStorage(`selected_employees_${selectedShop}_${selectedWeek}`, shopEmployees);
            setSelectedEmployeesLocal(storedSelectedEmployees);
            setSelectedEmployees(storedSelectedEmployees);
        } else {
            setEmployees([]);
            setSelectedEmployeesLocal([]);
            setSelectedEmployees([]);
        }
    }, [selectedShop, selectedWeek, setSelectedEmployees]);

    const handleShopChange = (e) => {
        const newShop = e.target.value;
        setSelectedShop(newShop);
        setError('');
    };

    const handleWeekChange = (e) => {
        const newWeek = e.target.value;
        setWeekInput(newWeek);
        try {
            const weekDate = new Date(newWeek);
            if (isNaN(weekDate.getTime())) {
                setError('Date de semaine invalide.');
                return;
            }
            setSelectedWeek(format(weekDate, 'yyyy-MM-dd'));
            setError('');
        } catch {
            setError('Format de date incorrect.');
        }
    };

    const handleEmployeeToggle = (employee) => {
        setSelectedEmployeesLocal(prev => {
            const newSelection = prev.includes(employee)
                ? prev.filter(emp => emp !== employee)
                : [...prev, employee];
            console.log('Updated selected employees:', newSelection);
            saveToLocalStorage(`selected_employees_${selectedShop}_${selectedWeek}`, newSelection);
            setSelectedEmployees(newSelection);
            return newSelection;
        });
    };

    const handleSelectAll = () => {
        setSelectedEmployeesLocal(employees);
        saveToLocalStorage(`selected_employees_${selectedShop}_${selectedWeek}`, employees);
        setSelectedEmployees(employees);
        console.log('Selected all employees:', employees);
    };

    const handleDeselectAll = () => {
        setSelectedEmployeesLocal([]);
        saveToLocalStorage(`selected_employees_${selectedShop}_${selectedWeek}`, []);
        setSelectedEmployees([]);
        console.log('Deselected all employees');
    };

    const handleNext = () => {
        if (!selectedShop) {
            setError('Veuillez sélectionner une boutique.');
            return;
        }
        if (!weekInput) {
            setError('Veuillez sélectionner une semaine.');
            return;
        }
        if (selectedEmployeesLocal.length === 0) {
            setError('Veuillez sélectionner au moins un employé.');
            return;
        }
        onNext();
    };

    return (
        <div className="employee-selection-container">
            <h2 style={{ fontFamily: 'Roboto, sans-serif', textAlign: 'center' }}>
                Sélection des employés
            </h2>
            {error && (
                <p style={{ fontFamily: 'Roboto, sans-serif', textAlign: 'center', color: '#e53935', marginBottom: '10px' }}>
                    {error}
                </p>
            )}
            <div className="form-group">
                <label>Boutique</label>
                <select value={selectedShop} onChange={handleShopChange}>
                    <option value="">Choisir une boutique</option>
                    {shops.map(shop => (
                        <option key={shop} value={shop}>{shop}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>Semaine</label>
                <input
                    type="date"
                    value={weekInput}
                    onChange={handleWeekChange}
                    placeholder="Sélectionner une semaine"
                />
            </div>
            {selectedShop && (
                <div className="form-group">
                    <label>Employés</label>
                    <div className="employee-list">
                        {employees.length === 0 ? (
                            <p style={{ fontFamily: 'Roboto, sans-serif', color: '#e53935' }}>
                                Aucun employé disponible pour cette boutique.
                            </p>
                        ) : (
                            employees.map(employee => (
                                <div key={employee} className="employee-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedEmployeesLocal.includes(employee)}
                                        onChange={() => handleEmployeeToggle(employee)}
                                    />
                                    {employee}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="button-group">
                        <Button className="button-primary" onClick={handleSelectAll}>
                            Tout sélectionner
                        </Button>
                        <Button className="button-reinitialiser" onClick={handleDeselectAll}>
                            Tout désélectionner
                        </Button>
                    </div>
                </div>
            )}
            <div className="navigation-buttons">
                <Button className="button-primary" onClick={handleNext} disabled={!selectedShop || !weekInput || selectedEmployeesLocal.length === 0}>
                    Suivant
                </Button>
            </div>
        </div>
    );
};

export default EmployeeSelection;