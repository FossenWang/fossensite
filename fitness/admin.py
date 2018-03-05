from django.contrib import admin
from .models import Equipment, MuscleGroup, Exercise, ProgramType, Program

admin.site.register([Equipment, MuscleGroup, Exercise, ProgramType, Program])
