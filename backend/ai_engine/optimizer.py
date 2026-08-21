from ortools.sat.python import cp_model
from .kinematics import KinematicsEngine

class ConflictOptimizer:
    def evaluate_routes(self, scenario_data: dict) -> dict:
        t1_id = scenario_data["train_1_id"]
        t2_id = scenario_data["train_2_id"]
        
        # 1. Physics Engine
        t1_stop_dist = KinematicsEngine.calculate_stopping_distance(scenario_data["train_1_speed"], scenario_data["train_1_type"])
        t2_stop_dist = KinematicsEngine.calculate_stopping_distance(scenario_data["train_2_speed"], scenario_data["train_2_type"])
        t1_momentum = KinematicsEngine.calculate_momentum(scenario_data["train_1_weight"], scenario_data["train_1_speed"])
        t2_momentum = KinematicsEngine.calculate_momentum(scenario_data["train_2_weight"], scenario_data["train_2_speed"])
        
        # 2. Google OR-Tools Constraint Programming Model
        model = cp_model.CpModel()
        
        # Variables: 1 if cleared for main line, 0 if diverted
        t1_main = model.NewBoolVar('t1_main')
        t2_main = model.NewBoolVar('t2_main')
        
        # Constraint: Both trains CANNOT occupy the main line bottleneck simultaneously
        model.Add(t1_main + t2_main == 1)
        
        # Objective: Maximize network momentum preservation (integer weights required)
        weight_1 = int(t1_momentum / 1000)
        weight_2 = int(t2_momentum / 1000)
        model.Maximize(t1_main * weight_1 + t2_main * weight_2)
        
        # Solve
        solver = cp_model.CpSolver()
        status = solver.Solve(model)
        
        if status == cp_model.OPTIMAL:
            if solver.Value(t1_main) == 1:
                priority = t1_id
                decision = f"OR-TOOLS OPTIMAL: Clear {t1_id} on main line. Preserves {weight_1}k momentum units. Divert {t2_id}."
            else:
                priority = t2_id
                decision = f"OR-TOOLS OPTIMAL: Clear {t2_id} on main line. Preserves {weight_2}k momentum units. Divert {t1_id}."
        else:
            priority = t1_id
            decision = "FALLBACK: Clear Train 1."
            
        return {
            "priority_train": priority,
            "recommendation": decision,
            "telemetry_data": {
                t1_id: {"stopping_distance_meters": round(t1_stop_dist, 2), "momentum_kg_ms": f"{t1_momentum:.2e}"},
                t2_id: {"stopping_distance_meters": round(t2_stop_dist, 2), "momentum_kg_ms": f"{t2_momentum:.2e}"}
            }
        }