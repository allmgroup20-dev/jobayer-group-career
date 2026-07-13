export { 
  hashPassword as hashWorkerPassword, 
  verifyPassword as verifyWorkerPassword, 
  generateToken, 
  verifyToken, 
  generateWorkerId 
} from "./worker-auth";

export { 
  hashPassword as hashCompanyPassword, 
  verifyPassword as verifyCompanyPassword, 
  generateCompanyToken, 
  verifyCompanyToken 
} from "./company-auth";
