import React, { useState } from 'react';
import Button from '../common/Button';
import { saveToLocalStorage, loadFromLocalStorage } from '../../utils/localStorage';
import { FaUpload } from 'react-icons/fa';
import '@/assets/styles.css';

const ShopSelection = ({ shops, selectedShop, setSelectedShop, onNext, onReset, setFeedback, setStep }) => {
    const [newShop, setNewShop] = useState('');

    const handleAddShop = () => {
        if (!newShop.trim()) {
            setFeedback('Erreur: Le nom de la boutique ne peut pas être vide.');
            return;
        }
        const upperCaseShop = newShop.trim().toUpperCase();
        if (shops.includes(upperCaseShop)) {
            setFeedback('Erreur: Cette boutique existe déjà.');
            return;
        }
        const updatedShops = [...shops, upperCaseShop];
        saveToLocalStorage('shops', updatedShops);
        setNewShop('');
        setFeedback('Succès: Boutique ajoutée.');
    };

    const handleRemoveShop = (shop) => {
        const updatedShops = shops.filter(s => s !== shop);
        saveToLocalStorage('shops', updatedShops);
        if (selectedShop === shop) {
            setSelectedShop('');
        }
        setFeedback('Succès: Boutique supprimée.');
    };

    const handleSelectShop = (shop) => {
        setSelectedShop(shop);
        setFeedback('');
    };

    const handleNext = () => {
        console.log('handleNext called with selectedShop:', selectedShop);
        if (!selectedShop) {
            setFeedback('Erreur: Veuillez sélectionner une boutique.');
            return;
        }
        if (typeof setStep !== 'function') {
            console.error('setStep is not a function:', setStep);
            setFeedback('Erreur: Action Valider non disponible.');
            return;
        }
        console.log('Calling onNext with shop:', selectedShop);
        onNext(selectedShop);
        setStep(3);
    };

    const handleReset = () => {
        if (typeof onReset !== 'function') {
            console.error('onReset is not a function:', onReset);
            setFeedback('Erreur: Action Réinitialiser non disponible.');
            return;
        }
        setNewShop('');
        setSelectedShop('');
        saveToLocalStorage('shops', []);
        onReset({ feedback: 'Succès: Liste des boutiques réinitialisée.' });
    };

    const handleImport = async () => {
        try {
            const [handle] = await window.showOpenFilePicker({
                types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
            });
            const file = await handle.getFile();
            const text = await file.text();
            const importData = JSON.parse(text);
            // Importer les boutiques
            saveToLocalStorage('shops', importData.shops || []);
            // Importer les employés, configurations et plannings par boutique
            Object.keys(importData.shops || []).forEach(shop => {
                saveToLocalStorage(`employees_${shop}`, importData[shop]?.employees || []);
                saveToLocalStorage(`timeSlotConfig_${shop}`, importData[shop]?.timeSlotConfig || {});
                Object.keys(importData[shop]?.weeks || {}).forEach(weekKey => {
                    saveToLocalStorage(`planning_${shop}_${weekKey}`, importData[shop].weeks[weekKey].planning || {});
                    saveToLocalStorage(`selected_employees_${shop}_${weekKey}`, importData[shop].weeks[weekKey].selectedEmployees || []);
                });
            });
            setFeedback('Importation réussie.');
            console.log('Imported data:', importData);
        } catch (error) {
            setFeedback('Erreur lors de l’importation.');
            console.error('Import error:', error);
        }
    };

    console.log('Rendering ShopSelection with shops:', shops, 'selectedShop:', selectedShop);

    return (
        <div className="step-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '465px' }}>
            <h2 style={{ fontFamily: 'Roboto, sans-serif', textAlign: 'center', marginBottom: '15px' }}>
                Sélection de la boutique
            </h2>
            <div className="shop-input" style={{ marginBottom: '15px', width: '100%', maxWidth: '400px' }}>
                <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', marginBottom: '5px', display: 'block', textAlign: 'center' }}>
                    Ajouter une boutique
                </label>
                <input
                    type="text"
                    value={newShop}
                    onChange={(e) => setNewShop(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddShop(); }}
                    placeholder="Nom de la boutique"
                    className="shop-input-field"
                />
                <Button
                    text="Ajouter"
                    onClick={handleAddShop}
                    style={{ backgroundColor: '#1e88e5', color: '#fff', padding: '8px 16px', fontSize: '14px', marginTop: '10px' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e88e5'}
                />
            </div>
            <div className="shop-list" style={{ marginBottom: '15px', width: '100%', maxWidth: '400px', maxHeight: '150px', overflowY: 'auto' }}>
                <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', marginBottom: '5px', display: 'block', textAlign: 'center' }}>
                    Boutiques disponibles
                </label>
                {shops.length === 0 ? (
                    <p style={{ fontFamily: 'Roboto, sans-serif', color: '#e53935', textAlign: 'center' }}>
                        Aucune boutique disponible.
                    </p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {shops.map(shop => (
                            <li key={shop} className="shop-item">
                                <Button
                                    text={shop.toUpperCase()}
                                    onClick={() => handleSelectShop(shop)}
                                    style={{
                                        backgroundColor: selectedShop === shop ? '#f28c38' : '#f0f0f0',
                                        color: selectedShop === shop ? '#fff' : '#333',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = selectedShop === shop ? '#d9742f' : '#e0e0e0'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = selectedShop === shop ? '#f28c38' : '#f0f0f0'}
                                >
                                    {shop.toUpperCase()}
                                    <span className="delete-icon" onClick={() => handleRemoveShop(shop)}>🗑️</span>
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="button-group" style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', marginTop: 'auto', width: '100%', maxWidth: '400px' }}>
                <Button
                    text="Retour"
                    onClick={() => {
                        if (typeof setStep !== 'function') {
                            console.error('setStep is not a function:', setStep);
                            setFeedback('Erreur: Action Retour non disponible.');
                            return;
                        }
                        setStep(1);
                    }}
                    style={{ backgroundColor: '#000000', color: '#fff', padding: '8px 16px', fontSize: '14px' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#000000'}
                />
                <Button
                    text="Valider"
                    onClick={handleNext}
                    style={{ backgroundColor: '#4caf50', color: '#fff', padding: '8px 16px', fontSize: '14px' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#388e3c'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4caf50'}
                />
                <Button
                    text="Réinitialiser"
                    onClick={handleReset}
                    style={{ backgroundColor: '#e53935', color: '#fff', padding: '8px 16px', fontSize: '14px' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c62828'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e53935'}
                />
                <Button
                    text="Importer"
                    onClick={handleImport}
                    style={{ backgroundColor: '#1e88e5', color: '#fff', padding: '8px 16px', fontSize: '14px' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e88e5'}
                >
                    <FaUpload /> Importer
                </Button>
            </div>
            <p style={{ fontFamily: 'Roboto, sans-serif', textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#ccc' }}>
                Klick-Planning - copyright © Nicolas Lefevre
            </p>
        </div>
    );
};

export default ShopSelection;