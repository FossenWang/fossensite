from django.contrib import admin
from .models import Equipment, MuscleGroup, Exercise, ProgramType, Program


class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'muscle', 'equipment')
    list_filter = ('muscle', 'equipment')


admin.site.register(Exercise, admin_class=ExerciseAdmin)
admin.site.register([Equipment, MuscleGroup, ProgramType, Program])
