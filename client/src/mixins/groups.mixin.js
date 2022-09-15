import axios from "axios";
import _ from "lodash";

const GroupsMixin = {
    data() {
        return {
            groups: [],
            groupPairs: {},
        }
    },
    methods: {
        async initGroups() {
            this.showLoading();

            try {
                let res = await axios.get(this.serverUrl + '/api/groups/all');
                this.groupPairs = res.data.reduce((acc, value) => {
                    return {...acc, [value.groupId]: value.number}
                })
                this.groups = res.data
            } catch (e) {
                console.log(e);
            }
            this.hideLoading();
        }

    }
}


export default GroupsMixin;