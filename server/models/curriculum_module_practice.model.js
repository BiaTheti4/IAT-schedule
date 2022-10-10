const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define('curriculum_module_practice', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        curriculumId: {type: DataTypes.INTEGER},
        moduleId: {type: DataTypes.INTEGER},
        type: {type: DataTypes.INTEGER},
        examSemester1: {type: DataTypes.INTEGER},
        examSemester2: {type: DataTypes.INTEGER},
        examSemester3: {type: DataTypes.INTEGER},
        examSemester4: {type: DataTypes.INTEGER},
        examSemester5: {type: DataTypes.INTEGER},
        examSemester6: {type: DataTypes.INTEGER},
        examSemester7: {type: DataTypes.INTEGER},
        examSemester8: {type: DataTypes.INTEGER},
        examSemester9: {type: DataTypes.INTEGER},
        examSemester10: {type: DataTypes.INTEGER},
        code: {type: DataTypes.INTEGER},
        semester1: {type: DataTypes.INTEGER},
        semester2: {type: DataTypes.INTEGER},
        semester3: {type: DataTypes.INTEGER},
        semester4: {type: DataTypes.INTEGER},
        semester5: {type: DataTypes.INTEGER},
        semester6: {type: DataTypes.INTEGER},
        semester7: {type: DataTypes.INTEGER},
        semester8: {type: DataTypes.INTEGER},
        semester9: {type: DataTypes.INTEGER},
        semester10: {type: DataTypes.INTEGER},
        curriculumSubjectId: {type: DataTypes.INTEGER},
        examSemesterGroup1: {type: DataTypes.INTEGER},
        examSemesterGroup2: {type: DataTypes.INTEGER},
        examSemesterGroup3: {type: DataTypes.INTEGER},
        examSemesterGroup4: {type: DataTypes.INTEGER},
        examSemesterGroup5: {type: DataTypes.INTEGER},
        examSemesterGroup6: {type: DataTypes.INTEGER},
        examSemesterGroup7: {type: DataTypes.INTEGER},
        examSemesterGroup8: {type: DataTypes.INTEGER},
        examSemesterGroup9: {type: DataTypes.INTEGER},
        examSemesterGroup10: {type: DataTypes.INTEGER}
    })

}
