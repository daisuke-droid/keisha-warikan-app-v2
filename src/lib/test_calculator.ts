import { calculateAllocation } from './calculator';
import { Participant, ROUNDING_METHODS, ROUNDING_UNITS, ADJUSTMENT_PRIORITIES } from '../types/index';

const mockParticipants: Participant[] = [
    { id: '1', name: 'Alice', rank: 'boss', weight: 1.5 },   // 上司
    { id: '2', name: 'Bob', rank: 'peer', weight: 1.0 },     // 一般
    { id: '3', name: 'Charlie', rank: 'junior', weight: 0.8 },// 新人
];

const totalAmount = 15000;

console.log('--- Test Case 1: Standard Weighted Split ---');
const result1 = calculateAllocation(
    totalAmount,
    mockParticipants,
    ROUNDING_UNITS.HUNDRED, // 100円単位
    ROUNDING_METHODS.CEIL,  // 切り上げ
    ADJUSTMENT_PRIORITIES.PAY_MORE
);

console.log('Total:', totalAmount);
result1.forEach(p => {
    console.log(`${p.name} (${p.weight}): ${p.calculatedAmount}`);
});
const sum1 = result1.reduce((acc, p) => acc + (p.calculatedAmount || 0), 0);
console.log('Calculated Sum:', sum1);
console.log('Match?', sum1 === totalAmount);


console.log('\n--- Test Case 2: Fixed Amount ---');
const mockWithFixed: Participant[] = [
    { id: '1', name: 'Alice', rank: 'boss', weight: 1.5, fixedAmount: 10000 },
    { id: '2', name: 'Bob', rank: 'peer', weight: 1.0 },
    { id: '3', name: 'Charlie', rank: 'junior', weight: 0.8 },
];
const result2 = calculateAllocation(
    20000,
    mockWithFixed,
    ROUNDING_UNITS.THOUSAND,
    ROUNDING_METHODS.ROUND,
    ADJUSTMENT_PRIORITIES.PAY_MORE
);
result2.forEach(p => {
    console.log(`${p.name}: ${p.calculatedAmount}`);
});
const sum2 = result2.reduce((acc, p) => acc + (p.calculatedAmount || 0), 0);
console.log('Calculated Sum:', sum2);
console.log('Match?', sum2 === 20000);
