from djongo import models

class Media(models.Model):
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video')
    ]

    year = models.IntegerField()
    square_index = models.IntegerField()
    place = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    url = models.URLField()
    caption = models.TextField(blank=True)
    coords = models.JSONField(blank=True, null=True)  # Support both old and new format
    deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.media_type.capitalize()} - {self.place or 'Inconnu'} ({self.year})"
