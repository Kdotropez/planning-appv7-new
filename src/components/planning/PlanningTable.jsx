import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import '@/assets/styles.css';

const PlanningTable = ({ config, selectedWeek, planning, selectedEmployees, toggleSlot, currentDay, calculateEmployeeDailyHours }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    const [dragValue, setDragValue] = useState(null);

    const handleMouseDown = (employee, slotIndex, dayIndex) => {
        setIsDragging(true);
        setDragStart({ employee, slotIndex, dayIndex });
        const currentValue = planning[employee]?.[format(addDays(new Date(selectedWeek), dayIndex), 'yyyy-MM-dd')]?.[slotIndex] || false;
        setDragValue(!currentValue);
        toggleSlot(employee, slotIndex, dayIndex, !currentValue);
    };

    const handleMouseOver = (employee, slotIndex, dayIndex) => {
        if (isDragging && dragStart) {
            toggleSlot(employee, slotIndex, dayIndex, dragValue);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragStart(null);
        setDragValue(null);
    };

    const handleClick = (employee, slotIndex, dayIndex) => {
        const currentValue = planning[employee]?.[format(addDays(new Date(selectedWeek), dayIndex), 'yyyy-MM-dd')]?.[slotIndex] || false;
        toggleSlot(employee, slotIndex, dayIndex, !currentValue);
    };

    const days = Array.from({ length: 7 }, (_, i) => ({
        name: format(addDays(new Date(selectedWeek), i), 'EEEE', { locale: fr }),
        date: format(addDays(new Date(selectedWeek), i), 'd MMMM', { locale: fr }),
    }));

    const getEmployeeColorClass = (index) => {
        const colors = ['employee-0', 'employee-1', 'employee-2', 'employee-3', 'employee-4', 'employee-5', 'employee-6'];
        return colors[index % colors.length];
    };

    return (
        <div className="table-container" onMouseUp={handleMouseUp}>
            <table className="planning-table">
                <thead>
                    <tr>
                        <th className="fixed-col">Employé</th>
                        {config.timeSlots.map((slot, index) => (
                            <th key={index} className="scrollable-col">
                                {slot}
                            </th>
                        ))}
                        <th className="scrollable-col">Total heures</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedEmployees.map((employee, employeeIndex) => (
                        <tr key={employee}>
                            <td className={`fixed-col employee ${getEmployeeColorClass(employeeIndex)}`}>{employee}</td>
                            {config.timeSlots.map((_, slotIndex) => {
                                const dayKey = format(addDays(new Date(selectedWeek), currentDay), 'yyyy-MM-dd');
                                const isChecked = planning[employee]?.[dayKey]?.[slotIndex] || false;
                                return (
                                    <td
                                        key={slotIndex}
                                        className={`scrollable-col ${isChecked ? `clicked-${employeeIndex % 7}` : ''}`}
                                        onMouseDown={() => handleMouseDown(employee, slotIndex, currentDay)}
                                        onMouseOver={() => handleMouseOver(employee, slotIndex, currentDay)}
                                        onClick={() => handleClick(employee, slotIndex, currentDay)}
                                    >
                                        {isChecked ? '✅' : ''}
                                    </td>
                                );
                            })}
                            <td className="scrollable-col">
                                {calculateEmployeeDailyHours(employee, format(addDays(new Date(selectedWeek), currentDay), 'yyyy-MM-dd'), planning).toFixed(1)} h
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PlanningTable;