from flask import Flask, jsonify
import paho.mqtt.client as mqtt
import os, time

app = Flask(__name__)

BROKER_HOST = os.getenv("MQTT_HOST", "localhost")
TOPIC_NAME = "environment/airdata"

# Dictionnaire pour stocker la dernière lecture
latest_metrics = {}

# Callback exécuté à la réception d’un message
def handle_message(client, userdata, msg):
    global latest_metrics
    raw = msg.payload.decode("utf-8").split(";")  # séparateur ;
    print(f"[MQTT] 🔔 Data reçue sur {msg.topic}: {raw}")

    if len(raw) == 6:
        try:
            latest_metrics = {
                "pm2_5": float(raw[0]),
                "pm10": float(raw[1]),
                "nitrogen_dioxide": float(raw[2]),
                "ozone": float(raw[3]),
                "carbon_monoxide": float(raw[4]),
                "air_quality_index": int(raw[5]),
            }
            print(f"[MQTT] ✅ Metrics mis à jour: {latest_metrics}")
        except Exception as e:
            print(f"[MQTT] ⚠ Erreur parsing: {e}")
    else:
        print("[MQTT] 🚫 Format ignoré")

# Connexion au broker avec retry
def connect_broker():
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.on_message = handle_message
    while True:
        try:
            print(f"[API] Tentative connexion broker @ {BROKER_HOST}...")
            client.connect(BROKER_HOST, 1883)
            break
        except ConnectionRefusedError:
            print("[API] Broker pas prêt, nouvelle tentative dans 3s...")
            time.sleep(3)
    return client

# Initialisation
mqtt_client = connect_broker()
mqtt_client.subscribe(TOPIC_NAME)
mqtt_client.loop_start()

@app.route("/metrics", methods=["GET"])
def metrics():
    if not latest_metrics:
        return jsonify({"status": "waiting", "details": "pas encore de données"}), 404
    return jsonify(latest_metrics)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=False)
