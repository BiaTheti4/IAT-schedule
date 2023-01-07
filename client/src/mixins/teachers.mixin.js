const TeachersMixin = {
    data() {
        return {
            teachers: [],
            teacherPairs: {},
        }
    },
    methods: {
        async initEmployees() {
            this.showLoading();
            try {
                let res = await this.$axios.get('ktp/getEmployees');
                this.teachers = res.data;
                this.teacherPairs = res.data.reduce((acc, value) => {
                    return {...acc, [value.id]: value.name}
                }, {})
            } catch (e) {
                console.log(e);
            }
            this.hideLoading();
        }
    }
}


export default TeachersMixin;