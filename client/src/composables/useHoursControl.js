import {computed, shallowRef, watch} from 'vue';
import moment from 'moment';
import api from '@/modules/axios';

export function useHoursControl() {
    const date = shallowRef(moment().format('YYYY-MM-DD'));
    const search = shallowRef('');
    const report = shallowRef(null);
    const loading = shallowRef(false);
    const error = shallowRef('');
    const subjects = computed(() => (report.value?.subjects || []).filter(row =>
        `${row.group} ${row.subject}`.toLowerCase().includes(search.value.toLowerCase())));
    watch(date, async (value, previous, cleanup) => {
        const controller = new AbortController();
        cleanup(() => controller.abort());
        report.value = null;
        error.value = '';
        if (!value) return;
        loading.value = true;
        try {
            const response = await api.get('schedule/hours-control', {params: {date: value}, signal: controller.signal});
            if (!controller.signal.aborted) report.value = response.data;
        } catch (e) {
            if (!controller.signal.aborted) error.value = e.response?.data?.message || 'Не удалось загрузить отчёт';
        } finally {
            if (!controller.signal.aborted) loading.value = false;
        }
    }, {immediate: true});
    return {date, search, report, subjects, loading, error};
}
