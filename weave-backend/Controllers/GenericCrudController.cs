using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class GenericCrudController<TEntity> : ControllerBase where TEntity : class
    {
        private readonly AppDbContext _context;
        private readonly DbSet<TEntity> _dbSet;
        private readonly string _keyName;

        protected GenericCrudController(AppDbContext context, string keyName)
        {
            _context = context;
            _dbSet = context.Set<TEntity>();
            _keyName = keyName;
        }

        [HttpGet]
        public virtual async Task<ActionResult<IEnumerable<TEntity>>> GetAll()
        {
            var items = await _dbSet.ToListAsync();
            return Ok(items);
        }

        [HttpGet("{id:int}")]
        public virtual async Task<ActionResult<TEntity>> GetById(int id)
        {
            var item = await _dbSet.FirstOrDefaultAsync(e => EF.Property<int>(e, _keyName) == id);
            if (item == null)
            {
                return NotFound();
            }

            return Ok(item);
        }

        [HttpPost]
        public virtual async Task<ActionResult<TEntity>> Create(TEntity entity)
        {
            _dbSet.Add(entity);
            await _context.SaveChangesAsync();

            var keyValue = entity!.GetType().GetProperty(_keyName)?.GetValue(entity);
            return CreatedAtAction(nameof(GetById), new { id = keyValue }, entity);
        }

        [HttpPut("{id:int}")]
        public virtual async Task<IActionResult> Update(int id, TEntity entity)
        {
            var keyProp = entity.GetType().GetProperty(_keyName);
            if (keyProp == null)
            {
                return BadRequest("Primary key property not found.");
            }

            var incomingId = keyProp.GetValue(entity);
            if (incomingId == null || Convert.ToInt32(incomingId) != id)
            {
                return BadRequest("ID mismatch.");
            }

            _context.Entry(entity).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                var exists = await _dbSet.AnyAsync(e => EF.Property<int>(e, _keyName) == id);
                if (!exists)
                {
                    return NotFound();
                }

                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public virtual async Task<IActionResult> Delete(int id)
        {
            var item = await _dbSet.FirstOrDefaultAsync(e => EF.Property<int>(e, _keyName) == id);
            if (item == null)
            {
                return NotFound();
            }

            _dbSet.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
