import paho.mqtt.client as mqtt
import time, random, os

BROKER_HOST = os.getenv("MQTT_HOST", "localhost")
TOPIC_NAME = "environment/airdata"

# Connexion au broker
def init_publisher():
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    while True:
        try:
            print(f"[Publisher] Connexion @ {BROKER_HOST}...")
            client.connect(BROKER_HOST, 1883)
            break
        except ConnectionRefusedError:
            print("[Publisher] Broker indisponible, retry dans 4s...")
            time.sleep(4)
    return client

client = init_publisher()
client.loop_start()

# Boucle de simulation
while True:
    sample = {
        "pm2_5": round(random.uniform(3, 60), 1),
        "pm10": round(random.uniform(8, 120), 1),
        "nitrogen_dioxide": round(random.uniform(1, 50), 2),
        "ozone": round(random.uniform(5, 90), 2),
        "carbon_monoxide": round(random.uniform(0.05, 3.0), 2),
        "air_quality_index": random.randint(0, 500),
    }

    message = ";".join(map(str, sample.values()))
    status = client.publish(TOPIC_NAME, message)

    if status[0] == 0:
        print(f"[Publisher] 🚀 Envoi réussi: {message}")
    else:
        print("[Publisher] ❌ Echec d’envoi")

    time.sleep(7)
