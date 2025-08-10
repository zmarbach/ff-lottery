from flask import Flask, jsonify, request
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

NUM_COMPETITIONS = 4
NUM_PLAYERS = 12

class TeamPercentage:
    def __init__(self, team_name, team_lottery_pick_points, team_lottery_pick_perc):
        self.original_name = team_name  # Keep original name for reference
        self.team_name = team_name      # Display name (can be edited)
        self.team_lottery_pick_points = team_lottery_pick_points
        self.team_lottery_pick_perc = team_lottery_pick_perc
    
    def to_dict(self):
        return {
            'team_name': self.team_name,
            'original_name': self.original_name,
            'team_lottery_pick_points': self.team_lottery_pick_points,
            'team_lottery_pick_perc': round(self.team_lottery_pick_perc, 1)
        }
    
    def __str__(self):
        return f"{self.team_name}: {self.team_lottery_pick_points} -- {round(self.team_lottery_pick_perc, 1)}%"

class LotteryDraft:
    def __init__(self):
        self.teams = []
        self.draft_order = []
        self.first_click = False
        self.load_teams()
    
    def calculate_triangular_number(self, n):
        if n < 1:
            return 0  
        return (n * (n + 1)) // 2
    
    def load_teams(self):
        """Load teams from CSV file"""
        try:
            with open("draft_perc.csv") as file:
                for line in file:
                    parts = line.strip().split(",")
                    self.teams.append(TeamPercentage(parts[0], float(parts[1]), 0))
        except FileNotFoundError:
            print("draft_perc.csv file not found")
        
        # Validate total points
        sum_lottery_pick_points = sum([team.team_lottery_pick_points for team in self.teams])
        expected_total = self.calculate_triangular_number(NUM_PLAYERS) * NUM_COMPETITIONS
        
        if sum_lottery_pick_points != expected_total:
            print(f'Warning: Lottery pick points of teams: {sum_lottery_pick_points} is not correct, should be: {expected_total}')
        
        self.calculate_percentages()
    
    def calculate_percentages(self):
        """Calculate lottery percentages for each team"""
        sum_lottery_pick_points = sum([team.team_lottery_pick_points for team in self.teams])
        
        for team in self.teams:
            team.team_lottery_pick_perc = (team.team_lottery_pick_points / sum_lottery_pick_points) * 100
    
    def generate_next_pick(self):
        """Generate the next draft pick"""
        if len(self.draft_order) >= NUM_PLAYERS:
            return None
            
        if not self.teams:
            return None
        
        # Select team based on weighted random choice
        chosen_team = random.choices(
            self.teams,
            weights=[team.team_lottery_pick_perc for team in self.teams],
            k=1
        )[0]
        
        # Add team name to draft order
        self.draft_order.append(chosen_team)
        
        # Remove selected team from remaining teams
        self.teams = [team for team in self.teams if team.team_name != chosen_team.team_name]
        
        # Recalculate percentages for remaining teams
        self.calculate_percentages()
        
        return chosen_team
    
    def update_team_name(self, original_name, new_name):
        """Update a team's display name"""
        # Update in remaining teams
        for team in self.teams:
            if team.original_name == original_name:
                team.team_name = new_name
                return True
        
        # Update in draft order as well
        for team in self.draft_order:
            if team.original_name == original_name:
                team.team_name = new_name
        
        return False
    
    def get_state(self):
        """Get current state of the draft"""
        return {
            'teams': [team.to_dict() for team in self.teams],
            'draft_order': [team.to_dict() for team in self.draft_order],
            'is_complete': len(self.draft_order) >= NUM_PLAYERS
        }

# Global lottery draft instance
lottery = LotteryDraft()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Backend is running'})

@app.route('/api/state', methods=['GET'])
def get_state():
    """Get current draft state"""
    return jsonify(lottery.get_state())

@app.route('/api/generate-pick', methods=['POST'])
def generate_pick():
    """Generate next draft pick"""
    chosen_team = lottery.generate_next_pick()
    
    if chosen_team is None:
        return jsonify({'error': 'Draft is complete or no teams available'}), 400
    
    return jsonify({
        'chosen_team': chosen_team.to_dict(),
        'pick_number': len(lottery.draft_order),
        'state': lottery.get_state()
    })

@app.route('/api/update-team-name', methods=['POST'])
def update_team_name():
    """Update a team's display name"""
    data = request.get_json()
    
    if not data or 'original_name' not in data or 'new_name' not in data:
        return jsonify({'error': 'Missing original_name or new_name'}), 400
    
    original_name = data['original_name']
    new_name = data['new_name']
    
    success = lottery.update_team_name(original_name, new_name)
    
    if success:
        return jsonify({'success': True, 'state': lottery.get_state()})
    else:
        return jsonify({'error': 'Team not found'}), 404

@app.route('/api/reset-draft', methods=['POST'])
def reset_draft():
    """Reset the draft to initial state"""
    global lottery
    lottery = LotteryDraft()
    return jsonify(lottery.get_state())

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
