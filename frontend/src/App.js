import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Modal from './Modal';
import FullScreenConfetti from './FullScreenConfetti';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [draftState, setDraftState] = useState({
    teams: [],
    draft_order: [],
    is_complete: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [loadingDots, setLoadingDots] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPickResultModal, setShowPickResultModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Fetch initial state on component mount
  useEffect(() => {
    fetchDraftState();
  }, []);

  // Animate loading dots
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingDots('');
      interval = setInterval(() => {
        setLoadingDots(prev => {
        
          return prev + '🥁';
        });
      }, 500);
    } else {
      setLoadingDots('');
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loading]);

  const fetchDraftState = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/state`);
      
      // Transform draft order to expected format
      const transformedDraftOrder = response.data.draft_order.map(team => {
        return {
          teamName: team.team_name,
          teamPercAtSelection: team.team_lottery_pick_perc
        }
      });
      
      setDraftState({
        ...response.data,
        draft_order: transformedDraftOrder
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch draft state');
      console.error('Error fetching draft state:', err);
    }
  };

  const generateNextPick = async () => {
    if (draftState.is_complete) return;

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/generate-pick`);
    
      // Transform draft order to expected format
      const updatedDraftOrder = response.data.state.draft_order.map(team => {
        return {
          teamName: team.team_name,
          teamPercAtSelection: team.team_lottery_pick_perc
        }
      });
      
      setDraftState({
        ...response.data.state,
        draft_order: updatedDraftOrder
      });
      setError(null);
      
      // Trigger confetti effect and modal
      setShowConfetti(true);
      setShowPickResultModal(true);
    } catch (err) {
      setError('Failed to generate next pick');
      console.error('Error generating pick:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClosePickResultModal = () => {  
    setShowPickResultModal(false);
    setShowConfetti(false);
  }

  const handleTeamNameEdit = (index, newName) => {
    // Only update local state during typing
    const updatedTeams = [...draftState.teams];
    updatedTeams[index] = { ...updatedTeams[index], team_name: newName };
    setDraftState({ ...draftState, teams: updatedTeams });
  };

  const persistTeamNameEdit = async (index) => {
    const team = draftState.teams[index];
    const originalName = team.original_name || team.team_name;
    const newName = team.team_name; // Use the current name from state
    
    // Only call backend if the name actually changed from the original
    if (newName === originalName) {
      return;
    }
    
    try {
      // Update the name on the backend
      const response = await axios.post(`${API_BASE_URL}/update-team-name`, {
        original_name: originalName,
        new_name: newName
      });
      
      if (response.data.success) {
        // Transform draft order to expected format
        const updatedDraftOrder = response.data.state.draft_order.map(team => {
          return {
            teamName: team.team_name,
            teamPercAtSelection: team.team_lottery_pick_perc
          }
        });
        
        setDraftState({
          ...response.data.state,
          draft_order: updatedDraftOrder
        });
      }
    } catch (err) {
      setError('Failed to update team name');
      console.error('Error updating team name:', err);
    }
  };

  const handleTeamNameClick = (index) => {
    setEditingTeam(index);
  };

  const handleTeamNameBlur = async (index) => {
    await persistTeamNameEdit(index);
    setEditingTeam(null);
  };

  const handleTeamNameKeyPress = async (e, index) => {
    if (e.key === 'Enter') {
      await persistTeamNameEdit(index);
      setEditingTeam(null);
    }
  };

  const handleResetDraft = () => {
    resetDraft();
  };

  const resetDraft = async () => {
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/reset-draft`);
      fetchDraftState();
    } catch (err) {
      setError('Failed to reset draft');
      console.error('Error resetting draft:', err);
    } finally {
      setLoading(false);
      setShowResetConfirmModal(false);
    }
  };

  // Random delay between 3s and 10s
  const getRandomDramaDelay = (min, max) => {
    var randomNum = Math.floor(Math.random() * (max - min + 1) + min);
    console.log('Drama delay: ' +  randomNum + ' seconds');
    return randomNum * 1000;
  };

  return (
    <div className="App">
      <FullScreenConfetti show={showConfetti} />
      <header className="App-header">
        <h1>🏆 Texan Boys Lottery Draft 🏆</h1>
        <button
          className="reset-button secondary-button"
          onClick={() => setShowResetConfirmModal(true)}
        >
          Reset Draft
        </button>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="draft-container">
        <div className="draft-section">
          <div className="odds-section">
            <h2>Current Draft Odds</h2>
            <div className="odds-list">
              {draftState.teams.length > 0 ? (
                draftState.teams.map((team, index) => (
                  <div key={index} className="team-odds">
                    {editingTeam === index ? (
                      <input
                        className="team-name-input"
                        type="text"
                        value={team.team_name}
                        onChange={(e) => handleTeamNameEdit(index, e.target.value)}
                        onBlur={() => handleTeamNameBlur(index)}
                        onKeyPress={(e) => handleTeamNameKeyPress(e, index)}
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="team-name editable" 
                        onClick={() => handleTeamNameClick(index)}
                        title="Click to edit"
                      >
                        {team.team_name}
                      </span>
                    )}
                    <span className="team-points">{team.team_lottery_pick_points} pts</span>
                    <span className="team-percentage">{team.team_lottery_pick_perc}%</span>
                  </div>
                ))
              ) : (
                <div className="no-teams">All teams have been drafted!</div>
              )}
            </div>
          </div>

          <div className="image-section">
            <div className="lottery-image">
              <img 
                src="/ff_final_photo.png" 
                alt="Fantasy Football" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="image-placeholder" style={{display: 'none'}}>
                🏈 Fantasy Football Lottery 🏈
              </div>
            </div>
          </div>

          <div className="draft-order-section">
            <h2>Draft Pick Selection Order</h2>
            <div className="draft-order-list">
              {draftState.draft_order.length > 0 ? (
                draftState.draft_order.map((team, index) => (
                  <div key={index} className="draft-pick">
                    <span className="pick-number">{index + 1}</span>
                    <span className="pick-team">{team.teamName}</span>
                    <span className="pick-odds-at-selection">
                      &nbsp;{team.teamPercAtSelection}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="no-picks">No picks made yet</div>
              )}
            </div>
          </div>
        </div>

        <div className="controls-section">
          {!draftState.is_complete && ( 
            <button 
              className={loading ? `generate-button secondary-button` : `generate-button primary-button`}
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  generateNextPick();
                }, getRandomDramaDelay(3, 10));
              }}
              disabled={loading || draftState.is_complete}
            >
              {loading ? ` 🥁${loadingDots} ` : `Generate Pick #${draftState.draft_order.length + 1}`}
            </button>
          )}

          {draftState.is_complete && (
            <div className="completion-message">
              🎉 Draft Complete! 🎉
            </div>
          )}
        </div>
      </div>
      
      <Modal show={showPickResultModal} onClose={() => handleClosePickResultModal()}>
        {/* Get last name in draft order because it will be most recent pick */}
        {draftState && draftState.draft_order.length > 0 && (
          <>
            <h2>🎉 {draftState.draft_order.at(-1).teamName} 🎉</h2>
            <p className='current-odds'>Odds: {draftState.draft_order.at(-1).teamPercAtSelection}%</p>
          </>
        )}
      </Modal>

      <Modal show={showResetConfirmModal} onClose={() => setShowResetConfirmModal(false)}>
          <>
            <h2>Confirm Reset</h2>
            <p className='reset-confirmation'>Are you sure you want to reset the draft?</p>
            <button className='primary-button' onClick={handleResetDraft}>Yes</button>
            <button className='secondary-button' onClick={() => setShowResetConfirmModal(false)}>Cancel</button>
          </>
      </Modal>
    </div>
  );
}

export default App;
