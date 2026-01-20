# Mejoras Propuestas Detalladas - Puntos Críticos y Alto Impacto

## 🔴 CRÍTICO - Acción Inmediata

---

### 1. **TypeORM Synchronize en Producción**

**Archivo:** `src/app.module.ts`  
**Línea:** 35

**Código Actual:**
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  autoLoadEntities: true,
  synchronize: true,  // ← LÍNEA 35 - PROBLEMA
  extra: {
    max: 10,
    idleTimeoutMillis: 30000,
  },
}),
```

**Código Propuesto:**
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  autoLoadEntities: true,
  synchronize: process.env.NODE_ENV !== 'production',  // ← MODIFICACIÓN
  migrations: ['dist/migrations/*.js'],  // ← AGREGAR
  migrationsRun: false,  // ← AGREGAR
  extra: {
    max: 10,
    idleTimeoutMillis: 30000,
  },
}),
```

**Acciones Adicionales:**
- Crear carpeta `src/migrations/`
- Configurar scripts en `package.json`:
  ```json
  "migration:generate": "typeorm migration:generate -n",
  "migration:run": "typeorm migration:run",
  "migration:revert": "typeorm migration:revert"
  ```

---

### 2. **Falta de Transacciones en Operaciones Críticas**

#### 2.1. **WoaService - saveWoa3**

**Archivo:** `src/woa/woa.service.ts`  
**Líneas:** 152-244 (método completo)

**Código Actual:**
```typescript
private async saveWoa3(data: CreateWoaDto[]): Promise<CreateWoaDto[]> {
  const woaSaved: CreateWoaDto[] = [];
  // ... código de preparación ...
  
  for (const dto of data) {
    // ... lógica de procesamiento ...
    if (existingWoa) {
      // ... actualización ...
      woaSaved.push(existingWoa);
    } else {
      // ... creación ...
      woaSaved.push(this.woaRepository.create(dto));
    }
  };

  const woaReturn = await this.woaRepository.save(woaSaved, { chunk: 100 }); 
  return woaReturn;
}
```

**Código Propuesto:**
```typescript
private async saveWoa3(data: CreateWoaDto[]): Promise<CreateWoaDto[]> {
  return await this.woaRepository.manager.transaction(async (transactionalEntityManager) => {
    const woaSaved: CreateWoaDto[] = [];
    
    // ... código de preparación existente ...
    
    for (const dto of data) {
      // ... lógica de procesamiento existente ...
      if (existingWoa) {
        // ... actualización ...
        woaSaved.push(existingWoa);
      } else {
        // ... creación ...
        woaSaved.push(transactionalEntityManager.create(Woa, dto));
      }
    };

    const woaReturn = await transactionalEntityManager.save(Woa, woaSaved, { chunk: 100 });
    return woaReturn;
  });
}
```

**Cambios Requeridos:**
- Importar `Woa` entity: `import { Woa } from './entities/woa.entity';`
- Envolver todo el método en `this.woaRepository.manager.transaction()`
- Usar `transactionalEntityManager` en lugar de `this.woaRepository`

---

#### 2.2. **IhtService - saveIth**

**Archivo:** `src/iht/iht.service.ts`  
**Líneas:** 86-138 (método completo)

**Código Actual:**
```typescript
private async saveIth(data: CreateIhtDto[]): Promise<CreateIhtDto[]> {
  let processData: CreateIhtDto[] = [];
  try {
    for(const dto of data) {
      const ith = await this.ihtRepository.findOne({ /* ... */ });
      if(ith != null || ith != undefined) {
        // ... actualización ...
        await this.ihtRepository.save(ith);
      } else {
        // ... creación ...
        await this.ihtRepository.save(ithEntity);
      }
    };
    return processData;
  } catch(error) {
    this.logger.logError(`Error al grabar la trama de IHT, error: ${error.message}`, error.stack);
  } 
}
```

**Código Propuesto:**
```typescript
private async saveIth(data: CreateIhtDto[]): Promise<CreateIhtDto[]> {
  return await this.ihtRepository.manager.transaction(async (transactionalEntityManager) => {
    let processData: CreateIhtDto[] = [];
    
    for(const dto of data) {
      const ith = await transactionalEntityManager.findOne(Iht, { /* ... */ });
      if(ith != null) {
        // ... actualización ...
        await transactionalEntityManager.save(Iht, ith);
      } else {
        // ... creación ...
        const ithEntity = transactionalEntityManager.create(Iht, dto);
        await transactionalEntityManager.save(Iht, ithEntity);
        processData.push(dto);
      }
    };
    
    return processData;
  });
}
```

**Cambios Requeridos:**
- Importar `Iht` entity
- Agregar transacción
- Cambiar `!= null || != undefined` por `!= null` (redundante)
- Retornar `processData` dentro del try, no fuera

---

#### 2.3. **ArticleService - saveArticles**

**Archivo:** `src/article/article.service.ts`  
**Líneas:** 187-279 (método completo)

**Código Actual:**
```typescript
private async saveArticles(data: CreateArticleDto[]) : Promise<CreateArticleDto[]>{
  const listArticles : CreateArticleDto[] = [];
  try {
    for(const dto of data) {
      try {
        const article = await this.articleRepository.findOne({ /* ... */ });
        if(article != null || article != undefined) {
          // ... actualización ...
          await this.articleRepository.save(article);
        } else {
          // ... creación ...
          await this.articleRepository.save(articleEntity);
        }
        // ... validación 14D ...
        listArticles.push(dto);
      } catch(error) {
        // ... manejo error ...
      }
    }
    return listArticles;
  } catch(error) {
    // ... manejo error ...
  }
}
```

**Código Propuesto:**
```typescript
private async saveArticles(data: CreateArticleDto[]) : Promise<CreateArticleDto[]>{
  return await this.articleRepository.manager.transaction(async (transactionalEntityManager) => {
    const listArticles : CreateArticleDto[] = [];
    
    for(const dto of data) {
      const article = await transactionalEntityManager.findOne(Article, { /* ... */ });
      if(article != null) {
        // ... actualización ...
        await transactionalEntityManager.save(Article, article);
      } else {
        // ... creación ...
        const articleEntity = transactionalEntityManager.create(Article, dto);
        await transactionalEntityManager.save(Article, articleEntity);
      }
      
      // ... validación 14D usando transactionalEntityManager ...
      listArticles.push(dto);
    }
    
    return listArticles;
  });
}
```

**Cambios Requeridos:**
- Importar `Article` entity
- Envolver en transacción
- Eliminar try-catch interno (dejar solo el externo de la transacción)
- Usar `transactionalEntityManager` para todas las operaciones

---

#### 2.4. **RouteService - saveRoutes**

**Archivo:** `src/route/route.service.ts`  
**Líneas:** 173-208

**Código Actual:**
```typescript
private async saveRoutes(data: CreateRouteDto[]) {
  data.forEach(async dto => {  // ← PROBLEMA: forEach con async no espera
    const route = await this.routeRepository.findOne({ /* ... */ });
    if(route != null || route != undefined) {
      // ... actualización ...
      await this.routeRepository.save(route);
    } else {
      // ... creación ...
      await this.routeRepository.save(routeEntity);
    }
  });
}
```

**Código Propuesto:**
```typescript
private async saveRoutes(data: CreateRouteDto[]) {
  return await this.routeRepository.manager.transaction(async (transactionalEntityManager) => {
    for(const dto of data) {  // ← Cambiar forEach por for...of
      const route = await transactionalEntityManager.findOne(Route, { /* ... */ });
      if(route != null) {
        // ... actualización ...
        await transactionalEntityManager.save(Route, route);
      } else {
        // ... creación ...
        const routeEntity = transactionalEntityManager.create(Route, dto);
        await transactionalEntityManager.save(Route, routeEntity);
      }
    }
  });
}
```

**Cambios Requeridos:**
- Cambiar `forEach` por `for...of` (forEach no espera async)
- Agregar transacción
- Importar `Route` entity

---

### 3. **Manejo de Errores Inconsistente**

#### 3.1. **IhtService - saveIth retorna undefined**

**Archivo:** `src/iht/iht.service.ts`  
**Líneas:** 135-137

**Código Actual:**
```typescript
catch(error) {
  this.logger.logError(`Error al grabar la trama de IHT, error: ${error.message}`, error.stack);
}  // ← No retorna nada, puede causar undefined
```

**Código Propuesto:**
```typescript
catch(error) {
  this.logger.logError(`Error al grabar la trama de IHT, error: ${error.message}`, error.stack);
  throw error;  // ← Propagar el error
  // O alternativamente:
  // return [];  // ← Retornar array vacío si se prefiere no fallar
}
```

---

#### 3.2. **ArticleService - saveArticles retorna undefined**

**Archivo:** `src/article/article.service.ts`  
**Líneas:** 276-278

**Código Actual:**
```typescript
catch(error){
  this.logger.logError(`Ocurrió un error en saveArticles, error: ${error.message}`, error.stack);
}  // ← No retorna nada
```

**Código Propuesto:**
```typescript
catch(error){
  this.logger.logError(`Ocurrió un error en saveArticles, error: ${error.message}`, error.stack);
  throw error;  // ← Propagar el error
}
```

---

#### 3.3. **WoaService - buildTramaDetalleKisoft retorna undefined**

**Archivo:** `src/woa/woa.service.ts`  
**Líneas:** 518-546

**Código Actual:**
```typescript
private buildTramaDetalleKisoft(data: CreateWoaDto[], oblpn: string): string {
  const partsTrama: string[] = [];
  try {
    const dataSearch = data.filter(w => w.oblpn == oblpn);
    if(dataSearch != undefined) {  // ← Array nunca es undefined
      // ... procesamiento ...
      return partsTrama.join('');
    }
  } catch(error) {
    this.logger.logError(`Error al construir trama kisoft, error: ${error.message}`, error.stack);
  }  // ← No retorna nada si hay error o dataSearch está vacío
}
```

**Código Propuesto:**
```typescript
private buildTramaDetalleKisoft(data: CreateWoaDto[], oblpn: string): string {
  const partsTrama: string[] = [];
  try {
    const dataSearch = data.filter(w => w.oblpn == oblpn);
    if(dataSearch && dataSearch.length > 0) {  // ← Mejor validación
      // ... procesamiento ...
      return partsTrama.join('');
    }
    return '';  // ← Retornar string vacío si no hay datos
  } catch(error) {
    this.logger.logError(`Error al construir trama kisoft, error: ${error.message}`, error.stack);
    return '';  // ← Retornar string vacío en caso de error
  }
}
```

---

## 🟠 ALTO IMPACTO

---

### 4. **Uso de setImmediate - Reemplazar por Colas**

#### 4.1. **WoaService - iniciarProceso**

**Archivo:** `src/woa/woa.service.ts`  
**Líneas:** 38-42

**Código Actual:**
```typescript
async iniciarProceso(trama: string) {
  setImmediate(async () => {
    await this.create(trama);
  });
}
```

**Código Propuesto:**
```typescript
async iniciarProceso(trama: string) {
  await this.woaQueue.add('process-woa', { trama }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
}
```

**Cambios Requeridos:**
1. Crear archivo `src/woa/woa.processor.ts`:
```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { WoaService } from './woa.service';

@Processor('woa-queue')
export class WoaProcessor extends WorkerHost {
  constructor(private readonly woaService: WoaService) {
    super();
  }

  async process(job: Job<{ trama: string }>) {
    await this.woaService.create(job.data.trama);
  }
}
```

2. En `woa.module.ts`, agregar:
```typescript
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'woa-queue',
    }),
  ],
  providers: [WoaService, WoaProcessor],
  // ...
})
```

3. En `WoaService`, inyectar:
```typescript
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

constructor(
  // ... otros servicios ...
  @InjectQueue('woa-queue') private readonly woaQueue: Queue,
) {}
```

---

#### 4.2. **ArticleService - iniciarProceso**

**Archivo:** `src/article/article.service.ts`  
**Línea:** 56

**Código Actual:**
```typescript
async iniciarProceso(tramas: string[]) {
  setImmediate(async () => {
    await this.procesaTramas(tramas);
  });
}
```

**Aplicar misma solución que WoaService con cola dedicada**

---

#### 4.3. **ReturnService - iniciarProceso**

**Archivo:** `src/return/return.service.ts`  
**Líneas:** 72-102

**Código Actual:**
```typescript
async iniciarProceso(trama: string) {
  const oblpn = this.extraerOblpn(trama);
  const trabajoAnterior = this.colaPorOblpn.get(oblpn) || Promise.resolve();
  
  const trabajoActual = trabajoAnterior.then(() => {
    return new Promise<void>((resolve) => {
      setImmediate(async () => {  // ← LÍNEA 81
        try {
          await this.procesaTrama(trama);
        } catch (error) {
          console.error(`Error procesando trama para OBLPN ${oblpn}:`, error);
        } finally {
          resolve();
        }
      });
    });
  });
  
  this.colaPorOblpn.set(oblpn, trabajoActual);
  trabajoActual.finally(() => {
    if (this.colaPorOblpn.get(oblpn) === trabajoActual) {
      this.colaPorOblpn.delete(oblpn);
    }
  });
}
```

**Código Propuesto:**
```typescript
async iniciarProceso(trama: string) {
  const oblpn = this.extraerOblpn(trama);
  
  await this.returnQueue.add(
    'process-return',
    { trama, oblpn },
    {
      jobId: oblpn,  // ← Evita duplicados por OBLPN
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    }
  );
}
```

**Nota:** El sistema de cola por OBLPN se reemplaza por la funcionalidad nativa de BullMQ con `jobId`.

---

#### 4.4. **Otros Servicios con setImmediate**

Aplicar misma solución a:
- `src/iht/iht.service.ts:30`
- `src/route-instruction/route-instruction.service.ts:33`
- `src/test/test.service.ts:19`
- `src/partner/partner.service.ts:16`
- `src/woa/process-files.service.ts:17`

---

### 5. **Consultas N+1 - Optimizar Consultas a BD**

#### 5.1. **WoaService - saveWoa3 - Consulta de existingWoas**

**Archivo:** `src/woa/woa.service.ts`  
**Líneas:** 162-173

**Código Actual:**
```typescript
const existingWoas = await this.woaRepository.find({
  where: data.map(dto => ({
    wave_number: dto.wave_number,
    order_number: dto.order_number,
    oblpn: dto.oblpn,
    part_a: dto.part_a,
    allocated_location: dto.allocated_location,
    mhe_system_code: dto.mhe_system_code,
    batch_nbr: dto.batch_nbr,
    order_seq_nbr1: dto.order_seq_nbr1,
  })),
});
```

**Problema:** TypeORM puede generar múltiples consultas OR, ineficiente para grandes volúmenes.

**Código Propuesto:**
```typescript
// Opción 1: Usar QueryBuilder con IN para cada campo
const waveNumbers = [...new Set(data.map(d => d.wave_number))];
const orderNumbers = [...new Set(data.map(d => d.order_number))];
const oblpns = [...new Set(data.map(d => d.oblpn))];

const existingWoas = await this.woaRepository
  .createQueryBuilder('woa')
  .where('woa.wave_number IN (:...waveNumbers)', { waveNumbers })
  .andWhere('woa.order_number IN (:...orderNumbers)', { orderNumbers })
  .andWhere('woa.oblpn IN (:...oblpns)', { oblpns })
  .andWhere('woa.part_a IN (:...partAs)', { partAs: [...new Set(data.map(d => d.part_a))] })
  .andWhere('woa.allocated_location IN (:...locations)', { locations: [...new Set(data.map(d => d.allocated_location))] })
  .andWhere('woa.mhe_system_code IN (:...codes)', { codes: [...new Set(data.map(d => d.mhe_system_code))] })
  .andWhere('woa.batch_nbr IN (:...batches)', { batches: [...new Set(data.map(d => d.batch_nbr))] })
  .andWhere('woa.order_seq_nbr1 IN (:...seqs)', { seqs: [...new Set(data.map(d => d.order_seq_nbr1))] })
  .getMany();

// Opción 2: Construir condiciones compuestas (más eficiente)
const conditions = data.map(dto => ({
  wave_number: dto.wave_number,
  order_number: dto.order_number,
  oblpn: dto.oblpn,
  part_a: dto.part_a,
  allocated_location: dto.allocated_location,
  mhe_system_code: dto.mhe_system_code,
  batch_nbr: dto.batch_nbr,
  order_seq_nbr1: dto.order_seq_nbr1,
}));

// Usar In() para cada campo si TypeORM lo soporta mejor
const existingWoas = await this.woaRepository
  .createQueryBuilder('woa')
  .where(
    conditions.map((cond, idx) => 
      `(woa.wave_number = :wave${idx} AND woa.order_number = :order${idx} AND ...)`
    ).join(' OR '),
    conditions.reduce((acc, cond, idx) => ({
      ...acc,
      [`wave${idx}`]: cond.wave_number,
      [`order${idx}`]: cond.order_number,
      // ...
    }), {})
  )
  .getMany();
```

**Recomendación:** Usar Opción 1 si los datos son únicos, o crear un índice compuesto en la BD.

---

#### 5.2. **ArticleService - saveArticles - Consulta en loop**

**Archivo:** `src/article/article.service.ts`  
**Líneas:** 192-205 y 252-257

**Código Actual:**
```typescript
for(const dto of data) {
  const article = await this.articleRepository.findOne({  // ← N+1 Query
    where: {
      Cod_Barra_Ubicacion: dto.Cod_Barra_Ubicacion,
      Cod_Alt_Producto: dto.Cod_Alt_Producto
    }
  });
  
  // ... más adelante ...
  const valid14D = await this.articleRepository  // ← Otra N+1 Query
    .createQueryBuilder('article')
    .where('article.Cod_Barra_Ubicacion = :ubicacion', { ubicacion: dto.Cod_Barra_Ubicacion })
    .andWhere('article.Cod_Alt_Producto != :codigo', { codigo: dto.Cod_Alt_Producto })
    .orderBy('COALESCE(article."ModifiedDate", article."CreatedDate")', 'DESC')
    .getOne();
}
```

**Código Propuesto:**
```typescript
// Cargar todos los artículos de una vez
const ubicaciones = [...new Set(data.map(d => d.Cod_Barra_Ubicacion))];
const codigos = [...new Set(data.map(d => d.Cod_Alt_Producto))];

const existingArticles = await this.articleRepository.find({
  where: [
    { Cod_Barra_Ubicacion: In(ubicaciones) },
    { Cod_Alt_Producto: In(codigos) }
  ]
});

const articlesMap = new Map<string, Article>();
existingArticles.forEach(art => {
  const key = `${art.Cod_Barra_Ubicacion}_${art.Cod_Alt_Producto}`;
  articlesMap.set(key, art);
});

// Cargar validaciones 14D de una vez
const valid14DMap = new Map<string, Article>();
const valid14DArticles = await this.articleRepository
  .createQueryBuilder('article')
  .where('article.Cod_Barra_Ubicacion IN (:...ubicaciones)', { ubicaciones })
  .andWhere('article.Cod_Alt_Producto NOT IN (:...codigos)', { codigos })
  .orderBy('COALESCE(article."ModifiedDate", article."CreatedDate")', 'DESC')
  .getMany();

valid14DArticles.forEach(art => {
  if (!valid14DMap.has(art.Cod_Barra_Ubicacion)) {
    valid14DMap.set(art.Cod_Barra_Ubicacion, art);
  }
});

// Procesar en loop usando los maps
for(const dto of data) {
  const key = `${dto.Cod_Barra_Ubicacion}_${dto.Cod_Alt_Producto}`;
  const article = articlesMap.get(key);
  
  // ... procesamiento ...
  
  const valid14D = valid14DMap.get(dto.Cod_Barra_Ubicacion);
  // ... usar valid14D ...
}
```

**Cambios Requeridos:**
- Importar `In` de TypeORM: `import { In } from 'typeorm';`
- Cargar datos antes del loop
- Usar Maps para búsqueda O(1)

---

#### 5.3. **IhtService - saveIth - Consulta en loop**

**Archivo:** `src/iht/iht.service.ts`  
**Líneas:** 91-98

**Código Actual:**
```typescript
for(const dto of data) {
  const ith = await this.ihtRepository.findOne({  // ← N+1 Query
    where: {
      group_nbr: dto.group_nbr,
      seq_nbr: dto.seq_nbr,
      activity_code: dto.activity_code
    }
  });
}
```

**Código Propuesto:**
```typescript
// Cargar todos los IHT de una vez
const groupNbrs = [...new Set(data.map(d => d.group_nbr))];
const seqNbrs = [...new Set(data.map(d => d.seq_nbr))];
const activityCodes = [...new Set(data.map(d => d.activity_code))];

const existingIhts = await this.ihtRepository.find({
  where: {
    group_nbr: In(groupNbrs),
    seq_nbr: In(seqNbrs),
    activity_code: In(activityCodes),
  }
});

const ihtMap = new Map<string, Iht>();
existingIhts.forEach(iht => {
  const key = `${iht.group_nbr}_${iht.seq_nbr}_${iht.activity_code}`;
  ihtMap.set(key, iht);
});

for(const dto of data) {
  const key = `${dto.group_nbr}_${dto.seq_nbr}_${dto.activity_code}`;
  const ith = ihtMap.get(key);
  // ... procesamiento ...
}
```

---

### 6. **Validación Insuficiente - Falta Validación de Entrada**

#### 6.1. **WoaController - create**

**Archivo:** `src/woa/woa.controller.ts`  
**Líneas:** 12-17

**Código Actual:**
```typescript
@Post()
@UseGuards(BasicAuthGuard)
create(@Body() trama: string) {
  this.woaService.iniciarProceso(trama);
  return { message: 'Proceso iniciado' };
}
```

**Código Propuesto:**

1. Crear DTO: `src/woa/dto/create-woa-request.dto.ts`
```typescript
import { IsString, IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class CreateWoaRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100000)  // Límite razonable
  @Matches(/^[^|]*(\|[^|]*)*$/, { message: 'Formato de trama inválido' })
  trama: string;
}
```

2. Modificar Controller:
```typescript
@Post()
@UseGuards(BasicAuthGuard)
create(@Body() dto: CreateWoaRequestDto) {
  this.woaService.iniciarProceso(dto.trama);
  return { message: 'Proceso iniciado' };
}
```

---

#### 6.2. **ArticleController - create**

**Archivo:** `src/article/article.controller.ts`  
**Líneas:** 10-16

**Código Actual:**
```typescript
@Post()
@UseGuards(BasicAuthGuard)
async create(@Body() tramas: string[]) {
  this.articleService.iniciarProceso(tramas);
  return { message: 'Proceso iniciado' };
}
```

**Código Propuesto:**

1. Crear DTO: `src/article/dto/create-article-request.dto.ts`
```typescript
import { IsArray, IsString, ArrayMaxSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TramaDto {
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateArticleRequestDto {
  @IsArray()
  @ArrayMaxSize(1000)  // Límite de tramas
  @ValidateNested({ each: true })
  @Type(() => TramaDto)
  tramas: string[];
}
```

2. Modificar Controller:
```typescript
@Post()
@UseGuards(BasicAuthGuard)
async create(@Body() dto: CreateArticleRequestDto) {
  this.articleService.iniciarProceso(dto.tramas);
  return { message: 'Proceso iniciado' };
}
```

---

#### 6.3. **ReturnController - create**

**Archivo:** `src/return/return.controller.ts`  
**Líneas:** 9-14

Aplicar misma solución con DTO de validación.

---

### 7. **Pool de Conexiones Pequeño**

**Archivo:** `src/app.module.ts`  
**Líneas:** 36-39

**Código Actual:**
```typescript
extra: {
  max: 10,
  idleTimeoutMillis: 30000,
},
```

**Código Propuesto:**
```typescript
extra: {
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),  // ← Aumentar a 20 por defecto
  min: parseInt(process.env.DB_POOL_MIN || '5', 10),   // ← Agregar mínimo
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),  // ← Agregar
  acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000', 10),  // ← Agregar
},
```

**Variables de Entorno a Agregar:**
```env
DB_POOL_MAX=20
DB_POOL_MIN=5
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=10000
DB_ACQUIRE_TIMEOUT=60000
```

---

### 8. **Código Duplicado**

#### 8.1. **Cálculo de volumen_linea duplicado**

**Archivo:** `src/woa/woa.service.ts`  
**Líneas:** 197-204

**Código Actual:**
```typescript
if (article && dto.allocated_qty) {
  volumen_linea = Number(dto.allocated_qty) * Number(article.Volumen_Unidad);
}

try{
  if (article && dto.allocated_qty) {  // ← DUPLICADO
    volumen_linea = Number(dto.allocated_qty) * Number(article.Volumen_Unidad);
  }
} catch(error) {
  this.logger.logError(`Error al obtener el article, error: ${error.message}`, error.stack);
}
```

**Código Propuesto:**
```typescript
try {
  if (article && dto.allocated_qty) {
    volumen_linea = Number(dto.allocated_qty) * Number(article.Volumen_Unidad);
  }
} catch(error) {
  this.logger.logError(`Error al calcular volumen_linea, error: ${error.message}`, error.stack);
  volumen_linea = 0;
}
```

**Eliminar líneas 197-199** (duplicado)

---

#### 8.2. **Lógica de guardado duplicada entre servicios**

**Problema:** `saveWoa3`, `saveIth`, `saveArticles` tienen lógica similar.

**Solución Propuesta:**

Crear servicio base: `src/shared/service/base-crud.service.ts`
```typescript
@Injectable()
export abstract class BaseCrudService<TEntity, TCreateDto, TUpdateDto> {
  protected abstract repository: Repository<TEntity>;
  protected abstract logger: LoggerService;
  
  protected abstract getEntityKey(dto: TCreateDto): any;
  protected abstract mapDtoToEntity(dto: TCreateDto, entity?: TEntity): TEntity;
  
  async saveOrUpdate(data: TCreateDto[]): Promise<TEntity[]> {
    return await this.repository.manager.transaction(async (manager) => {
      // Lógica común de guardado/actualización
      // Cada servicio implementa mapDtoToEntity y getEntityKey
    });
  }
}
```

**Nota:** Esta es una refactorización más compleja que requiere análisis adicional.

---

#### 8.3. **Condición redundante `!= null || != undefined`**

**Archivos afectados:**
- `src/iht/iht.service.ts:100`
- `src/article/article.service.ts:209`
- `src/route/route.service.ts:183`

**Código Actual:**
```typescript
if(ith != null || ith != undefined) {  // ← Redundante
```

**Código Propuesto:**
```typescript
if(ith != null) {  // ← null y undefined se cubren con != null
```

**Cambiar en todas las líneas mencionadas**

---

## 📋 Resumen de Archivos a Modificar

### Críticos:
1. `src/app.module.ts` - Línea 35
2. `src/woa/woa.service.ts` - Líneas 152-244
3. `src/iht/iht.service.ts` - Líneas 86-138, 100, 135-137
4. `src/article/article.service.ts` - Líneas 187-279, 209, 276-278
5. `src/woa/woa.service.ts` - Líneas 518-546

### Alto Impacto:
6. `src/woa/woa.service.ts` - Línea 39
7. `src/article/article.service.ts` - Línea 56
8. `src/return/return.service.ts` - Líneas 72-102
9. `src/iht/iht.service.ts` - Línea 30
10. `src/route-instruction/route-instruction.service.ts` - Línea 33
11. `src/test/test.service.ts` - Línea 19
12. `src/partner/partner.service.ts` - Línea 16
13. `src/woa/process-files.service.ts` - Línea 17
14. `src/woa/woa.service.ts` - Líneas 162-173
15. `src/article/article.service.ts` - Líneas 192-257
16. `src/iht/iht.service.ts` - Líneas 91-98
17. `src/woa/woa.controller.ts` - Líneas 12-17
18. `src/article/article.controller.ts` - Líneas 10-16
19. `src/return/return.controller.ts` - Líneas 9-14
20. `src/app.module.ts` - Líneas 36-39
21. `src/woa/woa.service.ts` - Líneas 197-204
22. `src/route/route.service.ts` - Líneas 173-208

---

**Nota:** Todas estas mejoras deben implementarse gradualmente y probarse en ambiente de desarrollo antes de aplicar en producción.
