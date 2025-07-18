import React, { useState } from 'react';
import { format, addMinutes, addDays } from 'date-fns';
import '../../assets/styles.css';

const PlanningTable = ({ config, selectedWeek, planning, selectedEmployees, toggleSlot, currentDay, calculateEmployeeDailyHours }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragEmployee, setDragEmployee] = useState(null);
    const [dragDayIndex, setDragDayIndex] = useState(null);
    const [dragValue, setDragValue] = useState(null);
    const [hasMoved, setHasMoved] = useState(false);

    // Valider selectedWeek
    let dayKey = '';
    try {
        if (!selectedWeek || isNaN(new Date(selectedWeek).getTime())) {
            throw new Error('Invalid selectedWeek');
        }
        dayKey = format(addDays(new Date(selectedWeek), currentDay), 'yyyy-MM-dd');
    } catch (error) {
        console.error('Invalid time value for selectedWeek:', selectedWeek, error);
        return (
            <div className="planning-container">
                <p style={{ fontFamily: 'Roboto, sans-serif', textAlign: 'center', color: '#e53935' }}>
                    Erreur: Date de semaine non valide.
                </p>
            </div>
        );
    }

    const getEndTime = (startTime, interval) => {
        if (!startTime) return '-';
        const [hours, minutes] = startTime.split(':').map(Number);
        const date = new Date(2025, 0, 1, hours, minutes);
        return format(addMinutes(date, interval), 'HH:mm');
    };

    const handleMouseDown = (employee, slotIndex, dayIndex) => {
        if (!config?.timeSlots?.length) return;
        setIsDragging(true);
        setDragEmployee(employee);
        setDragDayIndex(dayIndex);
        const currentValue = planning[employee]?.[dayKey]?.[slotIndex] || false;
        setDragValue(!currentValue);
        toggleSlot(employee, slotIndex, dayIndex, !currentValue);
        setHasMoved(false);
    };

    const handleMouseMove = (employee, slotIndex, dayIndex) => {
        if (isDragging && employee === dragEmployee && dayIndex === dragDayIndex && config?.timeSlots?.length) {
            setHasMoved(true);
            toggleSlot(employee, slotIndex, dayIndex, dragValue);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragEmployee(null);
        setDragDayIndex(null);
        setDragValue(null);
        setHasMoved(false);
    };

    const handleTouchStart = (employee, slotIndex, dayIndex, e) => {
        e.preventDefault();
        if (!config?.timeSlots?.length) return;
        setIsDragging(true);
        setDragEmployee(employee);
        setDragDayIndex(dayIndex);
        const currentValue = planning[employee]?.[dayKey]?.[slotIndex] || false;
        setDragValue(!currentValue);
        toggleSlot(employee, slotIndex, dayIndex, !currentValue);
        setHasMoved(false);
    };

    const handleTouchMove = (employee, slotIndex, dayIndex, e) => {
        if (isDragging && config?.timeSlots?.length) {
            e.preventDefault();
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            if (element && element.dataset.employee === employee && element.dataset.dayIndex === String(dayIndex)) {
                const slotIndex = parseInt(element.dataset.slotIndex, 10);
                if (!isNaN(slotIndex)) {
                    setHasMoved(true);
                    toggleSlot(employee, slotIndex, dayIndex, dragValue);
                }
            }
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setDragEmployee(null);
        setDragDayIndex(null);
        setDragValue(null);
        setHasMoved(false);
    };

    return (
        <div className="table-container">
            <table className="planning-table">
                <thead>
                    <tr>
                        <th className="fixed-col">DE</th>
                        {config.timeSlots && config.timeSlots.map((timeSlot, index) => (
                            <th key={index} className="scrollable-col">{timeSlot}</th>
                        ))}
                    </tr>
                    <tr>
                        <th className="fixed-col">À</th>
                        {config.timeSlots && config.timeSlots.map((timeSlot, index) => (
                            <th key={index} className="scrollable-col">
                                {getEndTime(timeSlot.split('-')[0], config.interval || 30)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {selectedEmployees.map((employee, empIndex) => (
                        <tr key={employee}>
                            <td className={`fixed-col employee employee-${empIndex % 7}`}>
                                {employee} ({calculateEmployeeDailyHours(employee, dayKey, planning).toFixed(1)} h)
                            </td>
                            {config.timeSlots && config.timeSlots.map((timeSlot, index) => (
                                <td
                                    key={`${employee}-${dayKey}-${index}`}
                                    className={`scrollable-col ${planning[employee]?.[dayKey]?.[index] ? `clicked-${empIndex % 7}` : ''}`}
                                    style={{ outline: 'none' }}
                                    data-employee={employee}
                                    data-slot-index={index}
                                    data-day-index={currentDay}
                                    data-testid={`slot-${employee}-${dayKey}-${index}`}
                                    onClick={() => {
                                        if (!hasMoved) {
                                            toggleSlot(employee, index, currentDay);
                                        }
                                    }}
                                    onMouseDown={() => handleMouseDown(employee, index, currentDay)}
                                    onMouseMove={() => handleMouseMove(employee, index, currentDay)}
                                    onMouseUp={handleMouseUp}
                                    onTouchStart={(e) => handleTouchStart(employee, index, currentDay, e)}
                                    onTouchMove={(e) => handleTouchMove(employee, index, currentDay, e)}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    {planning[employee]?.[dayKey]?.[index] ? '✅' : ''}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PlanningTable;