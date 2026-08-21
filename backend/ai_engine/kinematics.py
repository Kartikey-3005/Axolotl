# File: backend/ai_engine/kinematics.py

class KinematicsEngine:
    """
    Handles real-time physics calculations for train momentum and stopping distances.
    """
    
    # Standard deceleration rates (m/s^2) categorized by train type
    DECELERATION_RATES = {
        "Freight": 0.5,
        "Heavy Freight": 0.4,
        "Express": 0.8,
        "High_Speed": 1.2,
        "Commuter": 1.0,
        "Local": 1.0
    }

    @staticmethod
    def calculate_stopping_distance(speed_kmh: float, train_type: str) -> float:
        """
        Calculates stopping distance using d = v^2 / 2a.
        Returns distance in meters.
        """
        if speed_kmh <= 0:
            return 0.0
            
        # Convert km/h to m/s
        speed_ms = speed_kmh * (5.0 / 18.0)
        
        # Fetch appropriate deceleration rate, default to 0.5 if train type is unknown
        decel_rate = KinematicsEngine.DECELERATION_RATES.get(train_type, 0.5) 
        
        # Calculate and return stopping distance
        stopping_distance = (speed_ms ** 2) / (2 * decel_rate)
        return stopping_distance

    @staticmethod
    def calculate_momentum(weight_tonnes: float, speed_kmh: float) -> float:
        """
        Calculates momentum using p = mv.
        Returns momentum in kg*m/s.
        """
        if speed_kmh <= 0:
            return 0.0
            
        # Convert km/h to m/s and tonnes to kg
        speed_ms = speed_kmh * (5.0 / 18.0)
        mass_kg = weight_tonnes * 1000
        
        # Calculate and return momentum
        momentum = mass_kg * speed_ms
        return momentum