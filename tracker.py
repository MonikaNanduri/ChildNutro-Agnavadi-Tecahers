# Child Nutrition Tracker Logic (Python)
# --------------------------------------------------

def get_health_status(age, gender, height, weight):
    """
    Classifies a child's health based on growth data.
    Returns: (status, emoji, message, height_warning)
    """
    
    # Dataset based on real-world nutrition standards
    growth_data = {
        'boy': {
            2:  {'h': (85, 91),  'min_w': 10.5, 'max_w': 15.5},
            3:  {'h': (94, 101), 'min_w': 12.5, 'max_w': 18.0},
            4:  {'h': (100, 108), 'min_w': 13.5, 'max_w': 21.0},
            5:  {'h': (106, 113), 'min_w': 15.0, 'max_w': 24.0},
            6:  {'h': (116, 130), 'min_w': 18.0, 'max_w': 34.0},
            7:  {'h': (116, 130), 'min_w': 18.0, 'max_w': 34.0},
            8:  {'h': (116, 130), 'min_w': 19.0, 'max_w': 36.0},
            9:  {'h': (132, 150), 'min_w': 25.0, 'max_w': 52.0},
            10: {'h': (132, 150), 'min_w': 25.0, 'max_w': 52.0},
            11: {'h': (132, 150), 'min_w': 25.0, 'max_w': 52.0},
            12: {'h': (132, 150), 'min_w': 25.0, 'max_w': 52.0},
        },
        'girl': {
            2:  {'h': (84, 90),  'min_w': 10.0, 'max_w': 15.0},
            3:  {'h': (92, 100), 'min_w': 11.5, 'max_w': 17.5},
            4:  {'h': (98, 105), 'min_w': 13.0, 'max_w': 20.0},
            5:  {'h': (104, 110), 'min_w': 14.5, 'max_w': 23.5},
            6:  {'h': (115, 128), 'min_w': 17.0, 'max_w': 32.0},
            7:  {'h': (115, 128), 'min_w': 17.0, 'max_w': 32.0},
            8:  {'h': (115, 128), 'min_w': 18.0, 'max_w': 34.0},
            9:  {'h': (130, 150), 'min_w': 24.0, 'max_w': 50.0},
            10: {'h': (130, 150), 'min_w': 24.0, 'max_w': 50.0},
            11: {'h': (130, 150), 'min_w': 24.0, 'max_w': 50.0},
            12: {'h': (130, 150), 'min_w': 24.0, 'max_w': 50.0},
        }
    }

    gender = gender.lower()
    if gender not in growth_data or age not in growth_data[gender]:
        return "Unknown", "❓", "Age/Gender out of range", False

    config = growth_data[gender][age]
    
    # 1. Height Validation
    height_warning = False
    if height < config['h'][0] or height > config['h'][1]:
        height_warning = True

    # 2. Weight Classification
    if weight < config['min_w']:
        return "Underweight", "😟", "Child needs attention", height_warning
    elif weight > config['max_w']:
        return "Overweight", "⚠️", "Child needs attention", height_warning
    else:
        return "Normal", "😊", "Healthy growth", height_warning

# Food Suggestions
def get_food_suggestions(status):
    if status == "Underweight":
        return ["Milk 🥛", "Eggs 🥚", "Banana 🍌", "Rice + Dal 🍚", "High Protein foods"]
    elif status == "Normal":
        return ["Balanced diet 🥗", "Fresh Fruits 🍎", "Vegetables 🥦"]
    elif status == "Overweight":
        return ["Reduce junk food 🍟", "Avoid sugar 🍩", "More vegetables 🥦", "Exercise 🏃"]
    return ["Consult a doctor"]

# Example Usage:
# status, emoji, msg, h_warn = get_health_status(age=5, gender='boy', height=108, weight=14)
# print(f"Result: {status} {emoji} - {msg}")
# print(f"Food to eat: {', '.join(get_food_suggestions(status))}")

# Flask Integration Example:
'''
@app.route('/api/check_health', methods=['POST'])
def check_health():
    data = request.json
    status, emoji, msg, h_warn = get_health_status(
        data['age'], data['gender'], data['height'], data['weight']
    )
    return jsonify({
        "status": status,
        "emoji": emoji,
        "message": msg,
        "warning": h_warn,
        "food": get_food_suggestions(status)
    })
'''
