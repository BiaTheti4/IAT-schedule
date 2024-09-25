import _ from "lodash";

const GroupsMixin = {
    data() {
        return {
            groups: [],
            groupPairs: {},
            groupByCourse: {
                1: [],
                2: [],
                3: [],
                4: [],
                5: [],
            }
        }
    },
    methods: {
        async initGroups() {
            this.showLoading();

            try {
                let res = await this.$axios.get('groups/all', {
                    headers: {
                        'is-public': 'true'
                    }
                });
                this.groupPairs = res.data.reduce((acc, value) => {
                    return { ...acc, [value.groupId]: value.name }
                })
                let groupByCourse = {}
                this.groupByCourse = res.data.reduce((acc, value) => {
                    acc[value.course].push({ id: value.groupId, name: value.name });
                    return acc;
                }
                    , { 1: [], 2: [], 3: [], 4: [], 5: [], }
                )
                this.groups = res.data
            } catch (e) {
                console.log(e);
            }
            this.hideLoading();
        }

    }
}


export default GroupsMixin;