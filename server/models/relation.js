function applyExtraSetup(sequelize) {
    const {
        cabinet,
        cabinet_material,
        curriculum_module_practice,
        curriculum_subject,
        employee,
        employee_contract,
        group,
        ktp,
        ktp_block,
        ktp_theme,
        ktp_type,
        ktp_list,
        spec,
        subject,
        schedule,
        work_program_list,
        work_program_practice_lists,
    } = sequelize.models;


    cabinet.hasMany(cabinet_material, {
        as: 'materials',
        foreignKey: 'cabinet_id'
    })
    cabinet_material.belongsTo(cabinet, {
        as: 'cabinet',
        foreignKey: 'cabinet_id'
    })

    employee.hasMany(employee_contract, {
        as: 'contracts',
        foreignKey: 'employeeId'
    })
    employee_contract.belongsTo(employee, {
        as: 'employee',
        foreignKey: 'employeeId'
    })

    spec.hasMany(group, {
        as: 'groups',
        foreignKey: 'groupId'
    })

    group.belongsTo(spec, {
        as: 'spec',
        foreignKey: 'specId'
    })

    ktp.hasMany(ktp_block, {
        as: 'blocks',
        foreignKey: 'ktpId'
    })

    ktp.hasMany(schedule, {
        as: 'schedules',
        foreignKey: 'ktp_id'
    });

    ktp.belongsTo(employee, {
        as: 'employee',
        foreignKey: 'employeeId',
    });
    ktp.belongsTo(employee, {
        as: 'groupEmployee',
        foreignKey: 'group_employee',
    });
    ktp.belongsTo(employee, {
        as: 'groupCourseEmployee',
        foreignKey: 'group_k_employee',
    });

    ktp.belongsTo(group, {
        as: 'group',
        foreignKey: 'groupId',
    });

    ktp.belongsTo(subject, {
        as: 'subject',
        foreignKey: 'subjectId',
    });

    ktp_block.belongsTo(ktp, {
        foreignKey: 'ktpId',
        as: 'ktp'
    });
    ktp_block.hasMany(ktp_theme, {
        as: 'themes',
        foreignKey: 'blockId'
    });
    ktp_theme.belongsTo(ktp_block, {
        foreignKey: 'blockId',
        as: 'block'
    });
    ktp_theme.hasMany(ktp_list, {
        as: 'lists',
        foreignKey: 'themeId'
    });
    ktp_list.belongsTo(ktp_theme, {
        foreignKey: 'themeId',
        as: 'theme'
    });

    ktp_list.hasOne(work_program_list, {
        as: 'workProgramList'
    });
    ktp_list.hasOne(ktp_type, {
        foreignKey: 'typeId',
        sourceKey: 'typeId',
        as: 'ktpType'
    });
    ktp_type.belongsTo(ktp_list, {
        as: 'lists',
        foreignKey: 'typeId'
    });
    work_program_list.belongsTo(ktp_list, {
        foreignKey: 'workProgramListId',
        as: 'ktpList'
    });
    work_program_list.belongsToMany(cabinet_material, {
        through: 'WorkProgramListMaterial'
    });
    cabinet_material.belongsToMany(work_program_list, {
        through: 'WorkProgramListMaterial'
    });

    ktp_list.hasOne(work_program_practice_lists, {
        foreignKey: 'workProgramPracticeListId',
        as: 'workProgramPracticeList'
    });

    work_program_practice_lists.belongsTo(ktp_list, {
        foreignKey: 'workProgramPracticeListId',
        as: 'ktpList'
    });

    group.hasMany(ktp, {
        as: 'ktp',
        foreignKey: 'groupId'
    });

    employee.hasMany(ktp, {
        as: 'employee',
        foreignKey: 'employeeId'
    });

    subject.hasMany(ktp, {
        as: 'subject',
        foreignKey: 'subjectId'
    });


    schedule.belongsTo(ktp, {
        foreignKey: 'ktp_id',
        as: 'ktp'
    });

    ktp.belongsTo(curriculum_subject, {
        foreignKey: 'curriculumSubjectId',
        as: 'curriculumSubject'
    });

    curriculum_subject.hasMany(ktp, {
        foreignKey: 'curriculumSubjectId',
        as: 'ktps'
    })

    curriculum_subject.belongsTo(subject, {
        foreignKey: 'subjectId',
        as: 'subject'
    })

}

module.exports = {applyExtraSetup};

