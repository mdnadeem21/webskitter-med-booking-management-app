
const randomPassword = () =>{
    let charset ="@#$&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$&*0123456789abcdefghijklmnopqrstuvwxyz";
    let password = "";
  for (let i = 1; i <= 8; ++i) {

    password += charset.charAt(Math.floor(Math.random() * charset.length+1));
  }
  return password;
}