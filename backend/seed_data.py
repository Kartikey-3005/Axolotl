import csv
import random
from pathlib import Path

def generate_indian_railways_data():
    file_path = Path(__file__).parent / "data" / "indian_railways_logs.csv"
    file_path.parent.mkdir(exist_ok=True)

    trains = [
        ("Vande Bharat Express", "High_Speed", 430, 130),
        ("Bhopal Shatabdi", "Express", 550, 110),
        ("Rajdhani Express", "Express", 600, 120),
        ("WAG-12 Heavy Freight", "Heavy Freight", 6000, 75),
        ("BOXN Coal Rake", "Freight", 4500, 60),
        ("EMU Local", "Commuter", 300, 80)
    ]
    
    locations = ["Itarsi Junction", "Bhusawal Block", "Kanpur Central", "Nagpur Crossing", "Vijayawada Line"]
    risks = ["High", "Medium", "Low"]

    with open(file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["scenario_id", "train_1_id", "train_1_type", "train_1_weight", "train_1_speed", 
                         "train_2_id", "train_2_type", "train_2_weight", "train_2_speed", "location", "delay_risk"])
        
        for i in range(1, 501):
            t1 = random.choice(trains)
            t2 = random.choice(trains)
            while t1 == t2:  # Ensure different trains
                t2 = random.choice(trains)
                
            writer.writerow([
                i, 
                f"{t1[0]} ({random.randint(11000, 12999)})", t1[1], f"{t1[2]}t", f"{t1[3]} km/h",
                f"{t2[0]} ({random.randint(11000, 12999)})", t2[1], f"{t2[2]}t", f"{t2[3]} km/h",
                random.choice(locations), random.choice(risks)
            ])
            
    print(f"Successfully generated 500 real-world scenarios at {file_path}")

if __name__ == "__main__":
    generate_indian_railways_data()