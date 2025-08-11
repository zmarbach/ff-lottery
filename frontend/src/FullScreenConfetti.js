import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import './FullScreenConfetti.css';

const FullScreenConfetti = ({ show }) => {
    const { width, height } = useWindowSize();

    if (!show) return null;

    return (
        <div className='confetti-wrapper'>
            <Confetti
                width={width}
                height={height}
                numberOfPieces={200}
                gravity={0.5}
                colors={['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff']}
            />
        </div>
    )
}

export default FullScreenConfetti;
