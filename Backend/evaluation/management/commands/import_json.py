import os
import json
from django.core.management.base import BaseCommand
from evaluation.models import Media

BASE_MEDIA_URL = "https://grenoble.transect.fr"

class Command(BaseCommand):
    help = "Importe les médias des fichiers JSON (2016-2023) dans MongoDB"

    def handle(self, *args, **kwargs):
        data_path = os.path.join("evaluation", "data")
        files = [f for f in os.listdir(data_path) if f.endswith("-data.json")]

        for file_name in sorted(files):
            year = int(file_name.split("-")[0])
            full_path = os.path.join(data_path, file_name)

            with open(full_path, "r", encoding="utf-8") as f:
                entries = json.load(f)

            for entry in entries:
                square_index = entry.get("index")
                place = entry.get("place", "")
                description = entry.get("description", "")

                # Coordonnées
                coords = {
                    "lat_1": entry.get("lat_1"),
                    "lng_1": entry.get("lng_1"),
                    "lat_2": entry.get("lat_2"),
                    "lng_2": entry.get("lng_2"),
                    "x_coords": [entry.get(f"x_{i}") for i in range(1, 5) if entry.get(f"x_{i}")],
                    "y_coords": [entry.get(f"y_{i}") for i in range(1, 5) if entry.get(f"y_{i}")]
                }

                # Import vidéo s’il existe
                video = entry.get("video")
                if video and video.get("id"):
                    Media.objects.create(
                        year=year,
                        square_index=square_index,
                        place=place,
                        description=description,
                        media_type="video",
                        url=f"https://vimeo.com/{video['id']}",
                        caption=video.get("caption", ""),
                        coords=coords
                    )

                # Import photos
                for i in range(1, 5):
                    photo = entry.get(f"photo_{i}")
                    if photo:
                        full_url = BASE_MEDIA_URL + photo.get("large", "")
                        Media.objects.create(
                            year=year,
                            square_index=square_index,
                            place=place,
                            description=description,
                            media_type="image",
                            url=full_url,
                            caption=photo.get("caption", ""),
                            coords=coords
                        )

            self.stdout.write(self.style.SUCCESS(f"✅ {file_name} importé avec succès."))
