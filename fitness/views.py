from django.views.generic.list import ListView
from django.views.generic.detail import DetailView
from django.views.generic.edit import UpdateView

from .models import Equipment, MuscleGroup, Exercise, ProgramType, Program
from .forms import ProgramForm


class PageListView(ListView):
    '处理分页数据'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        pagination_data = self.pagination_data(
            context['paginator'], context['page_obj'], context['is_paginated'])
        context.update(pagination_data)
        return context

    def pagination_data(self, paginator, page, is_paginated):
        '分页数据'
        if not is_paginated:
            return {}
        left = []
        right = []
        left_has_more = False
        right_has_more = False
        first = False
        last = False
        page_number = page.number
        total_pages = paginator.num_pages
        page_range = paginator.page_range

        if page_number == 1:
            right = page_range[page_number:page_number + 2]
            if right[-1] < total_pages - 1:
                right_has_more = True
            if right[-1] < total_pages:
                last = True

        elif page_number == total_pages:
            left = page_range[(page_number - 3) if (page_number - 3) > 0 else 0:page_number - 1]
            if left[0] > 2:
                left_has_more = True
            if left[0] > 1:
                first = True
        else:
            left = page_range[(page_number - 3) if (page_number - 3) > 0 else 0:page_number - 1]
            right = page_range[page_number:page_number + 2]
            if right[-1] < total_pages - 1:
                right_has_more = True
            if right[-1] < total_pages:
                last = True
            if left[0] > 2:
                left_has_more = True
            if left[0] > 1:
                first = True

        data = {
            'left': left,
            'right': right,
            'left_has_more': left_has_more,
            'right_has_more': right_has_more,
            'first': first,
            'last': last,
        }

        return data


class ExerciseListView(PageListView):
    '动作列表'
    model = Exercise
    template_name = 'fitness/exercise_list.html'
    context_object_name = 'exercise_list'
    paginate_by = 20
    allow_empty = False

    def get_queryset(self):
        queryset = super().get_queryset()
        if 'muscle_id' in self.request.GET:
            queryset = queryset.filter(muscle_id=self.request.GET['muscle_id'])
        if 'equipment_id' in self.request.GET:
            queryset = queryset.filter(equipment_id=self.request.GET['equipment_id'])
        return queryset


class ProgramListView(PageListView):
    '训练方案列表'
    model = Program
    template_name = 'fitness/program_list.html'
    context_object_name = 'program_list'
    paginate_by = 10
    allow_empty = False

    def get_queryset(self):
        if self.kwargs['ptype_id'] == '0':
            return super().get_queryset()
        else:
            return super().get_queryset().filter(ptype_id=self.kwargs['ptype_id'])

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['ptype_id'] = self.kwargs['ptype_id']
        return context


class ProgramDetailView(DetailView):
    '方案详情视图'
    model = Program
    template_name = 'fitness/program_detail.html'
    context_object_name = 'program'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['pk'] = self.kwargs['pk']
        return context


class ProgramEditView(UpdateView):
    '修改方案视图'
    model = Program
    template_name = 'fitness/program_edit.html'
    context_object_name = 'program'
    form_class = ProgramForm

