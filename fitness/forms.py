from django.forms import ModelForm, HiddenInput

from .models import Program

class ProgramForm(ModelForm):
    class Meta:
        model = Program
        fields = ['name', 'cover', 'ptype', 'description', 'cycle', 'training']
        widgets = {
            'cycle': HiddenInput,
            'training': HiddenInput,
        }
