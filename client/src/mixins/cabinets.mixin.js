const CabinetsMixin = {
    data() {
        return {
            cabinets: [],
            cabinetPairs: {},
        }
    },
    methods: {
        async initCabinets() {
            this.showLoading();

            try {
                let res = await this.$axios.get('cabinets/all');
                this.cabinetsPairs = res.data.reduce((acc, value) => {
                    return {...acc, [value.id]: value.number}
                })
                this.cabinets = res.data
            } catch (e) {
                console.log(e);
            }
            this.hideLoading();

        }

    }
}


export default CabinetsMixin;