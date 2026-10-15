const Department = require('../model/department.model');


class departmentController{
    
        async createDepartment(req, res) {
            try {
                const { name, description } = req.body;
                if (!name) {
                    return res.status(400).json({
                        status: false,
                        message: 'Name is required' });
                }
                const department = new Department({ 
                    name, 
                    description:description?description:"" });
                await department.save();
                res.status(201).json({
                    status: true,
                    message: 'Department created successfully',
                    department
                });
            } catch (error) {
                res.status(400).json({ 
                    status: false,
                    message: error.message });
            }
        }
    
        async getDepartments(req, res) {
            try {
                const departments = await Department.find({ isDeleted: false });
                // if (departments.length === 0) {
                //     return res.status(404).json({ 
                //         status: false,
                //         message: 'No departments found' });
                // }
                res.status(200).json({
                    status: true,
                    size: departments.length,
                    message: 'Departments fetched successfully',
                    departments
                });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        }
    
        async getDepartmentById(req, res) {
            try {
                const deptId = req.params.id;
                if(!deptId) {
                    return res.status(400).json({ 
                        status: false,
                        message: 'Department ID is required' });
                }
                const department = await Department.findById(deptId);
                if (!department || department.isDeleted) {
                    return res.status(404).json({ message: 'Department not found' });
                }
                res.status(200).json({
                    status: true,
                    message: 'Department fetched successfully',
                    department
                });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        }
    
        async updateDepartment(req, res) {
            try {
                const deptId = req.params.id;
                const { name, description } = req.body;
                // check either name or description is provided for update
                if (!name && !description) {
                    return res.status(400).json({ 
                        status: false,
                        message: 'Name or description are required to update' });
                }
                if (name) {
                    const dup = await Department.findOne({ name: name.trim(), isDeleted: false, _id: { $ne: deptId } });
                    if (dup) return res.status(400).json({ status: false, message: "Department with this name already exists" });
                  }
                const department = await Department.findById(deptId);

                if (!department) {
                    return res.status(404).json({ message: 'Department not found' });
                }
                department.name = name?name:department.name;
                department.description = description?description:department.description;
                await department.save();
                res.status(200).json(department);
            } catch (error) {
                res.status(400).json({ 
                    status: false,
                    message: error.message });
            }
        }
    
        async deleteDepartment(req, res) {
            try {
                const deptId = req.params.id;
                const department = await Department.findById(deptId);
                if (!department || department.isDeleted) {
                    return res.status(404).json({ message: 'Department not found' });
                }
                department.isDeleted = true;
                await department.save();

                return res.status(200).json({ 
                    status: true,
                    message: 'Department deleted successfully' });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        }
}

module.exports = new departmentController()