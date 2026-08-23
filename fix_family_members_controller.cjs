const fs = require('fs');

const fmPath = 'd:/NIIE/graduation_Project/dtt_healthcare/dtt_healthcare_back_end/back_end_dtt_healthcare/Controllers/FamilyMembersController.cs';
let content = fs.readFileSync(fmPath, 'utf8');

const targetIdx = content.indexOf('public class UpdateFamilyMemberDto');
if (targetIdx !== -1) {
  content = content.substring(0, targetIdx);
  content += `public class UpdateFamilyMemberDto
{
    public int RealId { get; set; }
    public bool IsOwner { get; set; }
    public string? Name { get; set; }
    public string? Relationship { get; set; }
    public string? Dob { get; set; }
    public string? Gender { get; set; }
    public string? Phone { get; set; }
    public string? Cccd { get; set; }
    public string? Bhyt { get; set; }
    public string? Address { get; set; }
    public string? VerificationStatus { get; set; }
    public string? VerificationNote { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public string? VerifiedBy { get; set; }
}
`;
  fs.writeFileSync(fmPath, content, 'utf8');
  console.log('Fixed FamilyMembersController.cs syntax cleanly!');
}
